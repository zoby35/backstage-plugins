import { Box, Typography } from '@material-ui/core';
import LegacyCrossplaneV2CompositeResourcesTable from './LegacyCrossplaneV2CompositeResourcesTable';
import LegacyCrossplaneV2ManagedResources from './LegacyCrossplaneV2ManagedResources';
import CrossplaneV2OverviewCard from './CrossplaneV2OverviewCard';
import LegacyCrossplaneV2UsedResourcesTable from './LegacyCrossplaneV2UsedResourcesTable';

const LegacyCrossplaneV2ResourcesTable = () => {
    return (
        <Box>
            <Typography variant="h5" gutterBottom style={{ marginTop: '2rem' }}>
                Overview
            </Typography>
            <CrossplaneV2OverviewCard />
            
            <Typography variant="h5" gutterBottom>
                Composite Resource
            </Typography>
            <LegacyCrossplaneV2CompositeResourcesTable />

            <Typography variant="h5" gutterBottom style={{ marginTop: '2rem' }}>
                Managed Resources
            </Typography>
            <LegacyCrossplaneV2ManagedResources />

            <Typography variant="h5" gutterBottom style={{ marginTop: '2rem' }}>
                Additional Crossplane Resources
            </Typography>
            <LegacyCrossplaneV2UsedResourcesTable />
        </Box>
    );
};

export default LegacyCrossplaneV2ResourcesTable; 