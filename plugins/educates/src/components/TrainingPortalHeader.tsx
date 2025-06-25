import { Typography, Box, Divider, makeStyles, IconButton } from '@material-ui/core';
import { TrainingPortalStatus } from '@terasky/backstage-plugin-educates-common';
import { InfoCard } from '@backstage/core-components';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import { useState } from 'react';

const useStyles = makeStyles(theme => ({
  labelContainer: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  label: {
    marginRight: theme.spacing(2),
    marginBottom: theme.spacing(1),
  },
  headerContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: theme.palette.background.default,
    },
    padding: theme.spacing(1),
    borderRadius: theme.shape.borderRadius,
  },
  logo: {
    width: '40px',
    height: '40px',
    objectFit: 'contain',
  },
  titleSection: {
    flex: 1,
  },
  expandButton: {
    marginLeft: 'auto',
  },
  workshopCount: {
    marginLeft: theme.spacing(2),
    color: theme.palette.text.secondary,
  },
  contentSection: {
    marginTop: theme.spacing(2),
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.divider}`,
  },
}));

interface TrainingPortalHeaderProps {
  portal: TrainingPortalStatus;
  workshopCount: number;
  children?: React.ReactNode;
}

export const TrainingPortalHeader = ({ portal, workshopCount, children }: TrainingPortalHeaderProps) => {
  const classes = useStyles();
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <InfoCard>
      <Box p={2}>
        <Box 
          className={classes.headerContainer}
          onClick={toggleExpanded}
          role="button"
          tabIndex={0}
          onKeyPress={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              toggleExpanded();
            }
          }}
        >
          {portal.logo && (
            <img 
              src={portal.logo} 
              alt={`${portal.name} logo`} 
              className={classes.logo}
            />
          )}
          <Box className={classes.titleSection}>
            <Typography variant="h5">
              {portal.title || portal.name}
              <Typography component="span" variant="body1" className={classes.workshopCount}>
                ({workshopCount} workshop{workshopCount !== 1 ? 's' : ''})
              </Typography>
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Active Sessions: {portal.sessions.allocated} / {portal.sessions.maximum || 'Unlimited'}
            </Typography>
          </Box>
          <IconButton 
            className={classes.expandButton}
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
            onClick={(e) => {
              e.stopPropagation(); // Prevent double triggering from the container click
              toggleExpanded();
            }}
          >
            {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
        
        {isExpanded && (
          <Box className={classes.contentSection}>
            {Object.entries(portal.labels).length > 0 && (
              <>
                <Box className={classes.labelContainer}>
                  {Object.entries(portal.labels).map(([key, value]) => (
                    <Typography
                      key={key}
                      variant="body2"
                      color="textSecondary"
                      className={classes.label}
                    >
                      {key}: {value}
                    </Typography>
                  ))}
                </Box>
                <Divider style={{ margin: '16px 0' }} />
              </>
            )}
            {children}
          </Box>
        )}
      </Box>
    </InfoCard>
  );
}; 