import React from 'react';
import { Box, Typography } from '@material-ui/core';
import CrossplaneClaimResourcesTable from './CrossplaneClaimResourcesTable';
import CrossplaneCompositeResourcesTable from './CrossplaneCompositeResourcesTable';
import CrossplaneManagedResources from './CrossplaneManagedResources';
const CrossplaneAllResourcesTable = () => {
    return (
        <Box>
            <Typography variant="h5" gutterBottom>
                Claim Resource
            </Typography>
            <CrossplaneClaimResourcesTable />

            <Typography variant="h5" gutterBottom style={{ marginTop: '2rem' }}>
                Composite Resource
            </Typography>
            <CrossplaneCompositeResourcesTable />

            <Typography variant="h5" gutterBottom style={{ marginTop: '2rem' }}>
                Managed Resources
            </Typography>
            <CrossplaneManagedResources />
        </Box>
    );
};

export default CrossplaneAllResourcesTable;