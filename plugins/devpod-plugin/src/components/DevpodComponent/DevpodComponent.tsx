import { useDevpod } from '../../hooks/useDevpod';
import { InfoCard } from '@backstage/core-components';
import { VisuallyHidden } from '../VisuallyHidden';
import { Button, makeStyles } from '@material-ui/core';
import { Select, MenuItem } from '@material-ui/core';
import { DevpodIDE } from '../../types';
import { Entity } from '@backstage/catalog-model';
import { TextField, InputAdornment, IconButton } from '@material-ui/core';
import FileCopyIcon from '@material-ui/icons/FileCopy';

export const isDevpodAvailable = (entity: Entity): boolean => {
  const sourceAnnotation = entity.metadata?.annotations?.['backstage.io/source-location'] || '';
  return sourceAnnotation.startsWith('url:');
};

const useStyles = makeStyles((theme) => ({
  link: {
    textDecoration: 'underline',
    '&:hover': {
      textDecoration: 'none',
    },
  },
  select: {
    minWidth: 200,
    marginBottom: 16,
  },
  commandField: {
    marginTop: theme.spacing(2),
    width: '100%',
  },
  copyButton: {
    padding: theme.spacing(0.5),
  },
}));

export const DevpodComponent = () => {
  const { hasGitUrl, devpodUrl, selectedIde, setSelectedIde, componentName } = useDevpod();
  const styles = useStyles();

  const getDevpodCommand = () => {
    // Extract git URL from devpod URL format
    const hashParts = devpodUrl.split('#');
    const encodedGitUrl = hashParts[1]?.split('&')[0] || '';
    const gitUrl = decodeURIComponent(encodedGitUrl);
  
    // Generate workspace name using component name and random suffix
    const workspaceName = `${componentName}-${Math.random().toString(36).substring(2, 6)}`;
    
    return `devpod up --source git:${gitUrl} --ide ${selectedIde.toLowerCase()} ${workspaceName}`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getDevpodCommand());
  };

  return (
    <InfoCard title="Remote Development">
      {hasGitUrl ? (
        <>
          <div>
            <Select
              className={styles.select}
              value={selectedIde}
              onChange={(e) => setSelectedIde(e.target.value as DevpodIDE)}
            >
              {Object.entries(DevpodIDE).map(([key, value]) => (
                <MenuItem key={key} value={value}>
                  {key.toLowerCase().replace('_', ' ')}
                </MenuItem>
              ))}
            </Select>
          </div>
          <p>Your component can be opened in Devpod!</p>
          <Button
            variant="contained"
            color="primary"
            href={devpodUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
          >
            Open With DevPod
            <VisuallyHidden> (opens in Devpod)</VisuallyHidden>
          </Button>
          <TextField
            label="Command"
            className={styles.commandField}
            value={getDevpodCommand()}
            InputProps={{
              readOnly: true,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="copy to clipboard"
                    onClick={handleCopy}
                    className={styles.copyButton}
                  >
                    <FileCopyIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            variant="outlined"
            fullWidth
          />
        </>
      ) : (
        <p>No Git source URL found for this component</p>
      )}
    </InfoCard>
  );
};