import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Box, CircularProgress } from '@material-ui/core';
import { useApi } from '@backstage/core-plugin-api';
import { kubernetesApiRef } from '@backstage/plugin-kubernetes-react';
import { useEntity } from '@backstage/plugin-catalog-react';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import ErrorIcon from '@material-ui/icons/Error';
import WarningIcon from '@material-ui/icons/Warning';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import SkipNextIcon from '@material-ui/icons/SkipNext';
import CancelIcon from '@material-ui/icons/Cancel';

const useStyles = makeStyles((theme: any) => ({
  card: {
    marginBottom: theme.spacing(2),
    textAlign: 'center',
  },
  title: {
    fontSize: 14,
    textAlign: 'left',
  },
  pos: {
    marginBottom: 12,
  },
  success: {
    color: theme.palette.success.main,
  },
  error: {
    color: theme.palette.error.main,
  },
  warning: {
    color: theme.palette.warning.main,
  },
  info: {
    color: theme.palette.info.main,
  },
  icon: {
    verticalAlign: 'middle',
    marginRight: theme.spacing(1),
  },
  row: {
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
  },
}));

const KyvernoOverviewCard = () => {
  const classes = useStyles();
  const theme = useTheme();
  const { entity } = useEntity();
  const kubernetesApi = useApi(kubernetesApiRef);
  const [loading, setLoading] = useState(true);
  const [overviewData, setOverviewData] = useState({
    totalResources: 0,
    totalChecks: 0,
    totalPass: 0,
    totalFail: 0,
    totalError: 0,
    totalSkip: 0,
    totalWarn: 0,
  });

  useEffect(() => {
    const fetchOverviewData = async () => {
      setLoading(true);
      try {
        const response = await kubernetesApi.getWorkloadsByEntity({ entity, auth: {} });
        const resources = response.items.flatMap(item =>
          item.resources.flatMap(resourceGroup =>
            resourceGroup.resources.map(resource => ({
              resource,
              clusterName: item.cluster.name,
            }))
          )
        );

        const policyReports = await Promise.all(resources.map(async ({ resource, clusterName }) => {
          const { uid, namespace } = resource.metadata || {};
          if (!uid || !namespace) return null;

          const url = `/apis/wgpolicyk8s.io/v1alpha2/namespaces/${namespace}/policyreports/${uid}`;
          try {
            const response = await kubernetesApi.proxy({
              clusterName,
              path: url,
              init: { method: 'GET' },
            });
            const report = await response.json();
            return report;
          } catch (error) {
            console.error(`Failed to fetch policy report for ${uid}:`, error);
            return null;
          }
        }));

        const filteredReports = policyReports.filter(report => report !== null);
        const totalChecks = filteredReports.reduce((acc, report) => acc + (report?.results?.length || 0), 0);
        const totalPass = filteredReports.reduce((acc, report) => acc + (report?.summary?.pass || 0), 0);
        const totalFail = filteredReports.reduce((acc, report) => acc + (report?.summary?.fail || 0), 0);
        const totalError = filteredReports.reduce((acc, report) => acc + (report?.summary?.error || 0), 0);
        const totalSkip = filteredReports.reduce((acc, report) => acc + (report?.summary?.skip || 0), 0);
        const totalWarn = filteredReports.reduce((acc, report) => acc + (report?.summary?.warn || 0), 0);

        setOverviewData({
          totalResources: resources.length,
          totalChecks,
          totalPass,
          totalFail,
          totalError,
          totalSkip,
          totalWarn,
        });
      } catch (error) {
        console.error('Failed to fetch overview data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOverviewData();
  }, [kubernetesApi, entity]);

  return (
    <Card className={classes.card}>
      <CardContent>
        <Typography variant="h5" component="h1" align="left">
          Kyverno Policy Overview
        </Typography>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center">
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Typography variant="h5" component="h2">
              Kubernetes Resource Checked: {overviewData.totalResources}
            </Typography>
            <Typography variant="h5" component="h2" className={classes.pos} color="textSecondary">
              Total Checks Run: {overviewData.totalChecks}
            </Typography>
            <Box className={classes.row}>
              <Box>
                <ErrorIcon className={classes.icon} style={{ color: theme.palette.error.main }} />
                <Typography variant="body2" component="p" className={classes.error}>
                  Error: {overviewData.totalError}
                </Typography>
              </Box>
              <Box>
                <CancelIcon className={classes.icon} style={{ color: theme.palette.error.main }} />
                <Typography variant="body2" component="p" className={classes.error}>
                  Fail: {overviewData.totalFail}
                </Typography>
              </Box>
              <Box>
                <WarningIcon className={classes.icon} style={{ color: theme.palette.warning.main }} />
                <Typography variant="body2" component="p" className={classes.warning}>
                  Warn: {overviewData.totalWarn}
                </Typography>
              </Box>
            </Box>
            <Box className={classes.row}>
              <Box>
                <SkipNextIcon className={classes.icon} style={{ color: theme.palette.info.main }} />
                <Typography variant="body2" component="p" className={classes.info}>
                  Skip: {overviewData.totalSkip}
                </Typography>
              </Box>
              <Box>
                <CheckCircleIcon className={classes.icon} style={{ color: theme.palette.success.main }} />
                <Typography variant="body2" component="p" className={classes.success}>
                  Pass: {overviewData.totalPass}
                </Typography>
              </Box>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default KyvernoOverviewCard;