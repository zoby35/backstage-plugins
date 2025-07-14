import { Box, Typography } from '@material-ui/core';
import LegacyCrossplaneV1ClaimResourcesTable from './LegacyCrossplaneV1ClaimResourcesTable';
import LegacyCrossplaneV1CompositeResourcesTable from './LegacyCrossplaneV1CompositeResourcesTable';
import LegacyCrossplaneV1ManagedResources from './LegacyCrossplaneV1ManagedResources';
import LegacyCrossplaneV1UsedResourcesTable from './LegacyCrossplaneV1UsedResourcesTable';
const LegacyCrossplaneV1ResourcesTable = () => {
    return (
        <Box>
            <Typography variant="h5" gutterBottom>
                Claim Resource
            </Typography>
            <LegacyCrossplaneV1ClaimResourcesTable />

            <Typography variant="h5" gutterBottom style={{ marginTop: '2rem' }}>
                Composite Resource
            </Typography>
            <LegacyCrossplaneV1CompositeResourcesTable />

            <Typography variant="h5" gutterBottom style={{ marginTop: '2rem' }}>
                Managed Resources
            </Typography>
            <LegacyCrossplaneV1ManagedResources />

            <Typography variant="h5" gutterBottom style={{ marginTop: '2rem' }}>
                Additional Crossplane Resources
            </Typography>
            <LegacyCrossplaneV1UsedResourcesTable />
        </Box>
    );
};

export default LegacyCrossplaneV1ResourcesTable;