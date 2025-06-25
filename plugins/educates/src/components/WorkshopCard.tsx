import {
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Button,
  Typography,
  Box,
  Chip,
  makeStyles,
  Tooltip,
} from '@material-ui/core';
import { Workshop } from '@terasky/backstage-plugin-educates-common';
import { Progress } from '@backstage/core-components';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import BusinessIcon from '@material-ui/icons/Business';
import AccessTimeIcon from '@material-ui/icons/AccessTime';
import SchoolIcon from '@material-ui/icons/School';

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    border: `1px solid ${theme.palette.divider}`,
    boxShadow: theme.shadows[2],
    '&:hover': {
      boxShadow: theme.shadows[4],
    },
    transition: theme.transitions.create('box-shadow'),
  },
  chipContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(1),
  },
  infoChips: {
    marginBottom: theme.spacing(1),
  },
  tagChips: {
    marginTop: theme.spacing(1),
  },
  statsContainer: {
    marginTop: theme.spacing(2),
  },
  startButton: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  description: {
    flex: 1,
    marginBottom: theme.spacing(2),
  },
}));

interface WorkshopCardProps {
  workshop: Workshop;
  onStartWorkshop: () => void;
  canStart: boolean;
}

export const WorkshopCard = ({ workshop, onStartWorkshop, canStart }: WorkshopCardProps) => {
  const classes = useStyles();
  const available = workshop.environment.capacity - workshop.environment.allocated;
  const hasCapacity = available > 0;

  const getStartButtonTooltip = () => {
    if (!canStart) {
      return 'You do not have permission to start workshop sessions';
    }
    if (!hasCapacity) {
      return 'No available capacity for this workshop';
    }
    return '';
  };

  return (
    <Card className={classes.root}>
      <CardHeader
        title={workshop.title}
        subheader={
          <>
            <Box className={`${classes.chipContainer} ${classes.infoChips}`}>
              {workshop.vendor && (
                <Chip
                  size="small"
                  icon={<BusinessIcon />}
                  label={workshop.vendor}
                />
              )}
              {workshop.difficulty && (
                <Chip
                  size="small"
                  icon={<SchoolIcon />}
                  label={workshop.difficulty}
                />
              )}
              {workshop.duration && (
                <Chip 
                  size="small"
                  icon={<AccessTimeIcon />}
                  label={workshop.duration}
                />
              )}
            </Box>
            {workshop.tags.length > 0 && (
              <Box className={`${classes.chipContainer} ${classes.tagChips}`}>
                {workshop.tags.map((tag: string) => (
                  <Chip 
                    key={tag} 
                    size="small" 
                    label={tag}
                  />
                ))}
              </Box>
            )}
          </>
        }
      />
      <CardContent className={classes.content}>
        <Typography variant="body2" color="textSecondary" className={classes.description}>
          {workshop.description}
        </Typography>
        <Box className={classes.statsContainer}>
          <Typography variant="body2">
            Available: {available} / {workshop.environment.capacity}
          </Typography>
          <Progress
            value={(workshop.environment.allocated / workshop.environment.capacity) * 100}
            variant="determinate"
          />
        </Box>
      </CardContent>
      <CardActions>
        <Tooltip title={getStartButtonTooltip()}>
          <span>
            <Button
              color="primary"
              variant="contained"
              disabled={!hasCapacity || !canStart}
              onClick={onStartWorkshop}
              className={classes.startButton}
              endIcon={<OpenInNewIcon />}
            >
              Start Workshop
            </Button>
          </span>
        </Tooltip>
      </CardActions>
    </Card>
  );
};