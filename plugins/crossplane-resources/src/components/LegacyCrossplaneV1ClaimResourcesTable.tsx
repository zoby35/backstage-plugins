import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, Paper, Button, Drawer, IconButton, TableSortLabel, Box, Dialog, DialogTitle, DialogContent, Typography, useTheme } from '@material-ui/core';
import { useApi } from '@backstage/core-plugin-api';
import { KubernetesObject } from '@backstage/plugin-kubernetes';
import { kubernetesApiRef } from '@backstage/plugin-kubernetes-react';
import { useEntity } from '@backstage/plugin-catalog-react';
import YAML from 'js-yaml';
import CloseIcon from '@material-ui/icons/Close';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { saveAs } from 'file-saver';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { dark } from 'react-syntax-highlighter/dist/esm/styles/hljs';

import { usePermission } from '@backstage/plugin-permission-react';
import { listClaimsPermission, viewYamlClaimsPermission, showEventsClaimsPermission } from '@terasky/backstage-plugin-crossplane-common';
import { configApiRef } from '@backstage/core-plugin-api';

const removeManagedFields = (resource: KubernetesObject) => {
    const resourceCopy = JSON.parse(JSON.stringify(resource)); // Deep copy the resource
    if (resourceCopy.metadata) {
        if (resourceCopy.metadata.managedFields) {
            delete resourceCopy.metadata.managedFields;
        }
        if (resourceCopy.metadata.annotations && resourceCopy.metadata.annotations["kubectl.kubernetes.io/last-applied-configuration"]) {
            delete resourceCopy.metadata.annotations["kubectl.kubernetes.io/last-applied-configuration"];
        }
    }
    return resourceCopy;
};

const LegacyCrossplaneV1ClaimResourcesTable = () => {
    const { entity } = useEntity();
    const kubernetesApi = useApi(kubernetesApiRef);
    const config = useApi(configApiRef);
    const enablePermissions = config.getOptionalBoolean('crossplane.enablePermissions') ?? false;
    const theme = useTheme();
    const [resources, setResources] = useState<Array<KubernetesObject>>([]);
    const [selectedResource, setSelectedResource] = useState<KubernetesObject | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [eventsDialogOpen, setEventsDialogOpen] = useState(false);
    const [events, setEvents] = useState<Array<any>>([]);
    const [order, setOrder] = useState<'asc' | 'desc'>('asc');
    const [orderBy, setOrderBy] = useState<string>('name');

    const canListClaimsTemp = usePermission({ permission: listClaimsPermission }).allowed;
    const canViewYamlTemp = usePermission({ permission: viewYamlClaimsPermission }).allowed;
    const canShowEventsTemp = usePermission({ permission: showEventsClaimsPermission }).allowed;

    const canListClaims = enablePermissions ? canListClaimsTemp : true;
    const canViewYaml = enablePermissions ? canViewYamlTemp : true;
    const canShowEvents = enablePermissions ? canShowEventsTemp : true;


    useEffect(() => {
        if (!canListClaims) {
            return;
        }

        const fetchResources = async () => {
            const annotations = entity.metadata.annotations || {};
            const claimName = annotations['terasky.backstage.io/claim-name'];
            const plural = annotations['terasky.backstage.io/claim-plural'];
            const group = annotations['terasky.backstage.io/claim-group'];
            const version = annotations['terasky.backstage.io/claim-version'];
            const labelSelector = annotations['backstage.io/kubernetes-label-selector'];
            const namespace = labelSelector.split(',').find(s => s.startsWith('crossplane.io/claim-namespace'))?.split('=')[1];
            const clusterOfClaim = annotations['backstage.io/managed-by-location'].split(": ")[1];

            if (!plural || !group || !version || !namespace || !clusterOfClaim) {
                return;
            }

            const resourceName = claimName;
            const url = `/apis/${group}/${version}/namespaces/${namespace}/${plural}/${resourceName}`;

            try {
                const response = await kubernetesApi.proxy({
                    clusterName: clusterOfClaim,
                    path: url,
                    init: { method: 'GET' },
                });
                const resource = await response.json();
                setResources([resource]);
            } catch (error) {
                throw error;
            }
        };

        fetchResources();
    }, [kubernetesApi, entity, canListClaims]);

    const handleViewYaml = (resource: KubernetesObject) => {
        if (!canViewYaml) {
            return;
        }
        setSelectedResource(resource);
        setDrawerOpen(true);
    };

    const handleCloseDrawer = () => {
        setDrawerOpen(false);
        setSelectedResource(null);
    };

    const handleRequestSort = (property: string) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleDownloadYaml = (resource: KubernetesObject) => {
        const yamlContent = YAML.dump(removeManagedFields(resource));
        const blob = new Blob([yamlContent], { type: 'text/yaml;charset=utf-8' });
        const fileName = `${resource.kind}-${resource.metadata?.name}.yaml`;
        saveAs(blob, fileName);
    };

    const handleGetEvents = async (resource: KubernetesObject) => {
        if (!canShowEvents) {
            return;
        }

        const namespace = resource.metadata?.namespace;
        const name = resource.metadata?.name;
        const kind = resource.kind
        const clusterOfClaim = entity.metadata.annotations?.['backstage.io/managed-by-location'].split(": ")[1];

        if (!namespace || !name || !clusterOfClaim) {
            return;
        }

        const url = `/api/v1/namespaces/${namespace}/events?fieldSelector=involvedObject.name=${name},involvedObject.kind=${kind}`;

        try {
            const response = await kubernetesApi.proxy({
                clusterName: clusterOfClaim,
                path: url,
                init: { method: 'GET' },
            });
            const eventsResponse = await response.json();
            setEvents(eventsResponse.items);
            setEventsDialogOpen(true);
        } catch (error) {
            throw error;
        }
    };

    const handleCloseEventsDialog = () => {
        setEventsDialogOpen(false);
        setEvents([]);
    };

    const sortedResources = resources.sort((a, b) => {
        if (orderBy === 'name') {
            return (a.metadata?.name || '').localeCompare(b.metadata?.name || '') * (order === 'asc' ? 1 : -1);
        } else if (orderBy === 'creationTimestamp') {
            return (new Date(a.metadata?.creationTimestamp || '')).getTime() - (new Date(b.metadata?.creationTimestamp || '')).getTime() * (order === 'asc' ? 1 : -1);
        } else if (orderBy === 'kind') {
            return (a.kind || '').localeCompare(b.kind || '') * (order === 'asc' ? 1 : -1);
        } else if (orderBy === 'synced') {
            const aSynced = (a as any).status?.conditions?.some((condition: any) => condition.type === 'Synced') ? 'Yes' : 'No';
            const bSynced = (b as any).status?.conditions?.some((condition: any) => condition.type === 'Synced') ? 'Yes' : 'No';
            return aSynced.localeCompare(bSynced) * (order === 'asc' ? 1 : -1);
        } else if (orderBy === 'ready') {
            const aReady = (a as any).status?.conditions?.some((condition: any) => condition.type === 'Ready') ? 'Yes' : 'No';
            const bReady = (b as any).status?.conditions?.some((condition: any) => condition.type === 'Ready') ? 'Yes' : 'No';
            return aReady.localeCompare(bReady) * (order === 'asc' ? 1 : -1);
        }
        return 0;
    });
    if (!canListClaims) {
        return <Typography>You don't have permissions to view claim resources</Typography>;
    }
    return (
        <>
            <Paper>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sortDirection={orderBy === 'kind' ? order : false}>
                                <TableSortLabel
                                    active={orderBy === 'kind'}
                                    direction={orderBy === 'kind' ? order : 'asc'}
                                    onClick={() => handleRequestSort('kind')}
                                >
                                    Type
                                </TableSortLabel>
                            </TableCell>
                            <TableCell sortDirection={orderBy === 'name' ? order : false}>
                                <TableSortLabel
                                    active={orderBy === 'name'}
                                    direction={orderBy === 'name' ? order : 'asc'}
                                    onClick={() => handleRequestSort('name')}
                                >
                                    Name
                                </TableSortLabel>
                            </TableCell>
                            <TableCell sortDirection={orderBy === 'namespace' ? order : false}>
                                <TableSortLabel
                                    active={orderBy === 'namespace'}
                                    direction={orderBy === 'namespace' ? order : 'asc'}
                                    onClick={() => handleRequestSort('namespace')}
                                >
                                    Namespace
                                </TableSortLabel>
                            </TableCell>
                            <TableCell sortDirection={orderBy === 'synced' ? order : false}>
                                <TableSortLabel
                                    active={orderBy === 'synced'}
                                    direction={orderBy === 'synced' ? order : 'asc'}
                                    onClick={() => handleRequestSort('synced')}
                                >
                                    Synced
                                </TableSortLabel>
                            </TableCell>
                            <TableCell sortDirection={orderBy === 'ready' ? order : false}>
                                <TableSortLabel
                                    active={orderBy === 'ready'}
                                    direction={orderBy === 'ready' ? order : 'asc'}
                                    onClick={() => handleRequestSort('ready')}
                                >
                                    Ready
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>Kubernetes YAML</TableCell>
                            <TableCell>Kubernetes Events</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sortedResources.map(resource => (
                            <TableRow key={resource.metadata?.uid || `${resource.kind}-${Math.random()}`}>
                                <TableCell>{resource.kind}</TableCell>
                                <TableCell>{resource.metadata?.name}</TableCell>
                                <TableCell>{resource.metadata?.namespace}</TableCell>
                                <TableCell>
                                    {(resource as any).status?.conditions?.find((condition: any) => condition.type === 'Synced')?.status === 'True' ? 'Yes' : 'No'}
                                </TableCell>
                                <TableCell>
                                    {(resource as any).status?.conditions?.find((condition: any) => condition.type === 'Ready')?.status === 'True' ? 'Yes' : 'No'}
                                </TableCell>
                                <TableCell>
                                    <Button onClick={() => handleViewYaml(resource)} disabled={!canViewYaml}>View YAML</Button>
                                </TableCell>
                                <TableCell>
                                    <Button onClick={() => handleGetEvents(resource)} disabled={!canShowEvents}>Show Events</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Paper>
            <Drawer anchor="right" open={drawerOpen} onClose={handleCloseDrawer}>
                <div style={{ width: '50vw', padding: '16px' }}>
                    <IconButton onClick={handleCloseDrawer}>
                        <CloseIcon />
                    </IconButton>
                    {selectedResource && (
                        <>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                <CopyToClipboard text={YAML.dump(removeManagedFields(selectedResource))}>
                                    <Button variant="contained" color="primary">Copy to Clipboard</Button>
                                </CopyToClipboard>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => handleDownloadYaml(selectedResource)}
                                >
                                    Download YAML
                                </Button>
                            </Box>
                            <SyntaxHighlighter language="yaml" style={theme.palette.type === 'dark' ? dark : docco}>
                                {YAML.dump(removeManagedFields(selectedResource))}
                            </SyntaxHighlighter>
                        </>
                    )}
                </div>
            </Drawer>
            <Dialog open={eventsDialogOpen} onClose={handleCloseEventsDialog} maxWidth="xl" fullWidth>
                <DialogTitle>Events</DialogTitle>
                <DialogContent>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Type</TableCell>
                                <TableCell>Reason</TableCell>
                                <TableCell>Message</TableCell>
                                <TableCell>First Seen</TableCell>
                                <TableCell>Last Seen</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {events.map(event => (
                                <TableRow key={event.metadata?.uid}>
                                    <TableCell>{event.type}</TableCell>
                                    <TableCell>{event.reason}</TableCell>
                                    <TableCell>{event.message}</TableCell>
                                    <TableCell>{event.firstTimestamp}</TableCell>
                                    <TableCell>{event.lastTimestamp}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default LegacyCrossplaneV1ClaimResourcesTable;