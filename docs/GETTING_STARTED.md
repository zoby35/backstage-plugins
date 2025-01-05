# Getting Started Guide
This guide is meant to provide a simple guide for how to setup a backstage instance with the different plugins in this environment, setup the base infrastructure needed, and to deploy some sample configurations to get it up and running.

## Base Infra Setup
This section describes setting up the infra for the plugin backends.

### Setup A Kubernetes Cluster
In this guide we will setup a kind cluster and deploy some components to it. If you have an existing cluster you can skip to the next step.
  
Required Tools:
* kind
  
Now lets create a cluster:
```bash
kind create cluster --name idp-demo-cluster-01
```

### Install Crossplane
Required Tools:
* Helm
* Crossplane CLI

Lets install crossplane:
```bash
helm repo add crossplane-stable https://charts.crossplane.io/stable
helm repo update
helm install crossplane --namespace crossplane-system --create-namespace crossplane-stable/crossplane --version 1.18.2
``` 

#### Configure some sample crossplane configurations
The first thing we will do is install a few providers:
```bash
crossplane xpkg install provider xpkg.upbound.io/upbound/provider-kubernetes:v0.16.2
crossplane xpkg install provider xpkg.upbound.io/upbound/provider-helm:v0.20.2
```

Now lets install some Functions:
```bash
crossplane xpkg install function xpkg.upbound.io/crossplane-contrib/function-go-templating:v0.9.0
crossplane xpkg install function xpkg.upbound.io/crossplane-contrib/function-auto-ready:v0.4.0 
```

Now lets create the needed provider configs for our plugins to work with the local cluster
```bash
cat <<EOF | kubectl apply -f -
apiVersion: helm.crossplane.io/v1beta1
kind: ProviderConfig
metadata:
  name: helm-provider
spec:
  credentials:
    source: InjectedIdentity
---
apiVersion: kubernetes.crossplane.io/v1alpha1
kind: ProviderConfig
metadata:
  name: kubernetes-provider
spec:
  credentials:
    source: InjectedIdentity
EOF
```

We now need to add permissions to the ServiceAccounts created for the providers:
```bash
export HELM_PROVIDER_SA=`kubectl get sa -n crossplane-system --no-headers -o custom-columns=":metadata.name" | grep ^upbound-provider-helm`
export K8S_PROVIDER_SA=`kubectl get sa -n crossplane-system --no-headers -o custom-columns=":metadata.name" | grep ^upbound-provider-kubernetes`
kubectl create clusterrolebinding k8s-crossplane --clusterrole cluster-admin --serviceaccount crossplane-system:$K8S_PROVIDER_SA
kubectl create clusterrolebinding helm-crossplane --clusterrole cluster-admin --serviceaccount crossplane-system:$HELM_PROVIDER_SA
```

Now lets add some sample XRDs and Compositions to the cluster:
```bash
kubectl apply -f manifests/xrds.yaml
```

### Install Kyverno
Required Tools:
* Helm

Now lets install Kyverno:
```bash
helm repo add kyverno https://kyverno.github.io/kyverno/
helm repo update
helm install kyverno kyverno/kyverno -n kyverno --create-namespace
```

#### Configure some sample Kyverno Policies
Lets now apply some sample policies:

```bash
kubectl apply -f https://raw.githubusercontent.com/kyverno/policies/main/best-practices/require-drop-all/require-drop-all.yaml
kubectl apply -f https://raw.githubusercontent.com/kyverno/policies/main/best-practices/disallow-latest-tag/disallow-latest-tag.yaml
kubectl apply -f https://github.com/kyverno/policies/raw/main//best-practices/require-pod-requests-limits/require-pod-requests-limits.yaml
kubectl apply -f https://github.com/kyverno/policies/raw/main//best-practices/require-probes/require-probes.yaml
```

### Install ScaleOps
As ScaleOps is a commercial offering, follow the instructions from ScaleOps directly on installing ScaleOps. you can also get a free trial by going to [the website](https://scaleops.com/)

### Install DevPod
Follow the instructions to install DevPod on your machine from the [official documentation](https://devpod.sh/docs/getting-started/install)

#### Configure A Provider in DevPod
DevPod requires a provider to be configured. You can setup any provider you choose based on the [following documentation](https://devpod.sh/docs/managing-providers/add-provider)


## Create The Backstage Instance
Now that we have our base setup configured, in this section we will create a new backstage instance and then add the plugins into the new app

### Create the new backstage instance
Required Tools:
* yarn 4
* npx
* node 20

Lets create our base app:
```bash
npx @backstage/create-app@latest
```
This will ask for a few prompts and you should answer:
```
Need to install the following packages:
@backstage/create-app@0.5.23
Ok to proceed? (y) y

? Enter a name for the app [required] idp-demo
```

Once the yarn install process is done, you can move on to the next step.

### Add the needed plugin dependencies
Lets add our plugins and dependencies
```bash
cd idp-demo
yarn --cwd packages/app add @terasky/backstage-plugin-crossplane-resources-frontend	
yarn --cwd packages/app add @terasky/backstage-plugin-devpod	
yarn --cwd packages/app add @terasky/backstage-plugin-entity-scaffolder-content	
yarn --cwd packages/app add @terasky/backstage-plugin-scaleops-frontend	
yarn --cwd packages/app add @terasky/backstage-plugin-kyverno-policy-reports	

yarn --cwd packages/backend add @terasky/backstage-plugin-crossplane-permissions-backend
yarn --cwd packages/backend add @terasky/backstage-plugin-kubernetes-ingestor	
yarn --cwd packages/backend add @terasky/backstage-plugin-scaffolder-backend-module-terasky-utils	

# Dependant Packages
yarn --cwd packages/app add @backstage/plugin-kubernetes
yarn --cwd packages/backend add @backstage/plugin-kubernetes-backend
yarn --cwd packages/backend add @backstage/plugin-scaffolder-backend-module-github
yarn --cwd packages/backend add @backstage/plugin-scaffolder-backend-module-gitlab
yarn --cwd packages/backend add @backstage/plugin-scaffolder-backend-module-bitbucket
```

### Setup GitHub Integration
In this example we will use GitHub. you will need to do the following:
1. Create a GitHub Token
2. Create a GitHub Repository for GitOps configurations
3. Create a GitHun app for authorization

Lets start by creating a github repository:
```bash
export GITOPS_REPO_NAME="idp-demo-gitops"
gh repo create $GITOPS_REPO_NAME --public --add-readme --description "IDP Demo GitOps Repo"
```

For creating the app and PAT, please follow the Backstage docs [here](https://backstage.io/docs/auth/github/provider) and [here](https://backstage.io/docs/integrations/github/locations#token-scopes)

### Setup Authentication with GitHub
Authentication with GitHub should be setup as per [this doc](https://backstage.io/docs/auth/github/provider#configuration), and the frontend integration as per [this doc](https://backstage.io/docs/auth/#using-multiple-providers).

For an example of the final config you can refer to the backstage app in this repo which has GitHub integrated.

### Setup RBAC plugin
To make RBAC easier in backstage, we recommend using the community RBAC plugins but this is not a requirement. 

For instructions on installing the plugin follow [this doc](https://github.com/backstage/community-plugins/blob/main/workspaces/rbac/plugins/rbac-backend/README.md) for the backend plugin and [this doc](https://github.com/backstage/community-plugins/blob/main/workspaces/rbac/plugins/rbac/README.md) for the frontend plugin.

For an example of integrating the plugin you can look at the app in this repo which has the RBAC plugin integrated.

### Add the backend plugins
Lets now add the backend plugins into our app:

In your packages/backend/src/index.ts file just above the "backend.start();" line we will add our plugins:
```typescript
backend.add(import('@backstage/plugin-kubernetes-backend')); // it may already exist, otherwise add it.
backend.add(import('@terasky/backstage-plugin-kubernetes-ingestor'));
backend.add(import('@backstage-community/scaffolder-backend-module-regex'));
backend.add(import('@backstage/plugin-scaffolder-backend-module-github'));
backend.add(import('@backstage/plugin-scaffolder-backend-module-gitlab'));
backend.add(import('@backstage/plugin-scaffolder-backend-module-bitbucket'));
backend.add(import('@backstage/plugin-scaffolder-backend-module-azure'));
backend.add(import('@backstage/plugin-auth-backend-module-github-provider'));
backend.add(import('@terasky/backstage-plugin-crossplane-permissions-backend'));
backend.add(import('@backstage/plugin-catalog-backend-module-ldap'));
backend.add(import('@terasky/backstage-plugin-scaffolder-backend-module-terasky-utils'));
```
This will auto wire up those plugins when we start our app.

### Add the frontend plugins Components
Now we need to configure the forntend plugins:

#### Kubernetes Plugin
We need to add the default Kubernetes Frontend plugin.

Add to the Entity Page
```typescript
import { EntityKubernetesContent } from '@backstage/plugin-kubernetes';

const serviceEntityPage = (
  <EntityLayout>
    ...
    <EntityLayout.Route path="/kubernetes" title="Kubernetes">
      <EntityKubernetesContent refreshIntervalMs={30000} />
    </EntityLayout.Route>
    ...
  </EntityLayout>
);
```

#### DevPod
Add to Entity Page (packages/app/src/components/catalog/EntityPage.tsx)
```typescript
import { DevpodComponent, isDevpodAvailable } from '@terasky/backstage-plugin-devpod';

...

const overviewContent = (
<Grid container spacing={3} alignItems="stretch">
  ...

  <EntitySwitch>
    <EntitySwitch.Case if={isDevpodAvailable}>
      <Grid item md={6}>
        <DevpodComponent />
      </Grid>
    </EntitySwitch.Case>
  </EntitySwitch>

  ...
</Grid>
);
```

#### Crossplane
Add to Entity Page (packages/app/src/components/catalog/EntityPage.tsx):
```typescript
import { CrossplaneAllResourcesTable, CrossplaneResourceGraph, isCrossplaneAvailable } from '@terasky/backstage-plugin-crossplane-resources-frontend';

const crossplaneOverviewContent = (
  <Grid container spacing={3} alignItems="stretch">
    {entityWarningContent}
    <Grid item md={6}>
      <EntityAboutCard variant="gridItem" />
    </Grid>
    <Grid item md={4} xs={12}>
      <EntityLinksCard />
    </Grid>
    <Grid item md={8} xs={12}>
      <EntityHasSubcomponentsCard variant="gridItem" />
    </Grid>
  </Grid>
);

const crossplaneEntityPage = (
  <EntityLayout>
    <EntityLayout.Route path="/" title="Overview">
      {crossplaneOverviewContent}
    </EntityLayout.Route>
    <EntityLayout.Route
      path="/kubernetes"
      title="Kubernetes"
      if={isKubernetesAvailable}
    >
      <EntityKubernetesContent />
    </EntityLayout.Route>
    <EntityLayout.Route if={isCrossplaneAvailable} path="/crossplane-resources" title="Crossplane Resources">
      <CrossplaneAllResourcesTable />
    </EntityLayout.Route>
    <EntityLayout.Route if={isCrossplaneAvailable} path="/crossplane-graph" title="Crossplane Graph">
      <CrossplaneResourceGraph />
    </EntityLayout.Route>
  </EntityLayout>
);


const componentPage = (
<EntitySwitch>
  ...
  <EntitySwitch.Case if={isComponentType('crossplane-claim')}>
    {crossplaneEntityPage}
  </EntitySwitch.Case>
  ...
);
```
#### Entity Scaffolder
Add to Entity Page (packages/app/src/components/catalog/EntityPage.tsx):
```typescript
import { EntityScaffolderContent } from '@terasky/backstage-plugin-entity-scaffolder-content';

...

const systemPage = (
<EntityLayout>
  ...
  
  <EntityLayout.Route path="/scaffolder" title="Crossplane Scaffolder">
      <EntityScaffolderContent
        templateGroupFilters={[
          {
            title: 'Crossplane Claims',
            filter: (entity, template) =>
              template.metadata?.labels?.forEntity === 'system' &&
              entity.spec?.type === 'kubernetes-namespace',
          },
        ]}
        buildInitialState={entity => ({
            xrNamespace: entity.metadata.name,
            clusters: [entity.metadata?.annotations?.['backstage.io/managed-by-location']?.split(": ")[1] ?? '']
          }
        )}
      />
  </EntityLayout.Route>

  ...
</EntityLayout>
);
```

#### ScaleOps
Add to Entity Page (packages/app/src/components/catalog/EntityPage.tsx):
```typescript
import { ScaleOpsDashboard, isScaleopsAvailable } from '@terasky/backstage-plugin-scaleops-frontend'


const serviceEntityPage = (
<EntityLayout>
  ...
  
  <EntityLayout.Route if={isScaleopsAvailable} path="/scaleops" title="ScaleOps">
    <ScaleOpsDashboard />
  </EntityLayout.Route>

  ...
</EntityLayout>
);
```
#### Kyverno
Add to Entity Page (packages/app/src/components/catalog/EntityPage.tsx):
```typescript
import { KyvernoPolicyReportsTable } from '@terasky/backstage-plugin-kyverno-policy-reports';

...

const serviceEntityPage = (
<EntityLayout>
  ...
  
  <EntityLayout.Route path="/kyverno-policy-reports" title="Kyverno Policy Reports">
    <KyvernoPolicyReportsTable />
  </EntityLayout.Route>

  ...
</EntityLayout>
);
```
## Generating The app-config.local.yaml
There are many options available in these differen plugins. Bellow you will find a good starting point for configuration. further customization options can be found in the dedicated plugin folders in this repo.

### RBAC Settings
If you dont want to use the permission framework for the crossplane plugin you must set:
```yaml
crossplane:
  enablePermissions: false
```

If you setup the RBAC plugins, you can add the crossplane plugin as follows in the list of plugins supporting permissions to get the integration:
```yaml
permission:
  enabled: true # If RBAC is not needed this can be disabled
  rbac:
    # policies-csv-file: (Optional) FULL PATH TO A CSV FILE like the permissions.csv in this repo to prepopulate roles and permissions
    # policyFileReload: true # If adding a CSV file this helps in dev mode.
    pluginsWithPermission:
      - catalog
      - permission
      - kubernetes
      - crossplane
      - scaffolder
    # Configure these options as per your organizations needs
    admin:
      users:
        - name: user:default/dev01
        - name: group:default/idp-admins
        - name: user:development/guest
    superAdmin:
      users:
        - name: user:default/dev01
        - name: group:default/idp-admins
        - name: user:development/guest
```
### Kubernetes Plugin Settings
For the plugins to work, we need the Kubernetes plugins installed and setup in your environment. We have already installed them above, and the configuration we will use in this case is using ServiceAccount tokens for authentication.

The first step is to create a service account, secret with a static token, and pull data about our cluster which we will use to populate our app-config.yaml

```bash
kubectl create ns backstage
kubectl create sa -n backstage backstage
kubectl create clusterrolebinding backstage-creds --clusterrole cluster-admin --serviceaccount backstage:backstage
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Secret
metadata: 
  name: backstage
  namespace: backstage
  annotations:
    kubernetes.io/service-account.name: "backstage"
type: kubernetes.io/service-account-token
EOF
export SA_TOKEN=`kubectl get secret -n backstage backstage -o jsonpath='{.data.token}' | base64 -d`
export K8S_URL=`kubectl config view --raw --minify -o jsonpath='{.clusters[0].cluster.server}'`
export K8S_CA=`kubectl config view --raw --minify -o jsonpath='{.clusters[0].cluster.certificate-authority-data}'`

echo "Kubernetes App Config Section:

kubernetes:
  serviceLocatorMethod:
    type: 'multiTenant'
  clusterLocatorMethods:
    - type: 'config'
      clusters:
        - name: idp-demo-cluster-01
          url: ${K8S_URL}
          authProvider: 'serviceAccount'
          serviceAccountToken: ${SA_TOKEN}
          caData: ${K8S_CA}
"
```

### Kubernetes Ingestor Settings
Now we can setup the Kubernetes Ingestor configuration. 

This is the main section where we have quite a few things to configure split into 3 main areas:
1. Software Template Generation - Generating software templates for all XRDs in a cluster
2. Component and System Creation - Generating components for all workloads in a cluster and systems for namespaces
3. Component creation for Crossplane Claims - Auto generate components for all Crossplane claims regardless of the API group, without needing to register the type with Backstage manually.

Let see bellow some basic configuration that is good for starting. For all options and advanced capabilities check the plugin README.

#### XRD Template Generation
For XRD Generation, many knobs have been exposed to configure how the generated software templates are created.
Just like workload and claim component generation, we by default will ingest all XRDs to the catalog, but if you only want annotated XRDs to be added you can set the field ingestAllXRDs bellow to false. you can then annotate the XRDs you want added with terasky.backstage.io/add-to-catalog set to "true".
```yaml
kubernetesIngestor:
  xrds:
    ingestAllXRDs: true
```
You can also fully disable XRD ingestion by setting the enabled field to false:
```yaml
kubernetesIngestor:
  xrds:
    enabled: true
```
The next option is how to handle default values in the XRD schema. by default, we will keep those defaults in the template, but if you dont want all defaulted fields to be in the generated manifest, you can set the convertDefaultValuesToPlaceholders key to true like bellow, which will remove the default values configuration, but put the value as placeholder in the UI for easy UX.
```yaml
kubernetesIngestor:
  xrds:
    convertDefaultValuesToPlaceholders: true
```
The next key section describes how you want to configure the publishing step of the templates. The plugin supports and promotes a GitOps approach where the manifests generated are pushed to a Git repo where a GitOps tool would come into the mix and pull down the changes once merged. While this works for many, if you dont want to set this up, we also support setting the target key to "yaml" which will disable the Git options in the template.
We also support currently GitHub, GitLab and BitBucket by setting the target value to any of these target types. 
If using one of the Git values, allowedTargets should be set with the FQDN of the Git Servers you want to allow.
Depending on how you organize your GitOps repositories, we have the ability to enable or disable repo selection in the template form. if the key allowRepoSelection is set to true, the user can select the org and repo name for where to push the manifest. if it is set to false, then under the git key you must fill out the repoUrl in the backstage format of \<GIT SERVER\>?owner=\<OWNER or ORG\>&repo=\<REPO NAME\>, and also set the targetBranch the PR should be opened against.
```yaml
kubernetesIngestor:
  xrds:
    publishPhase:
      target: github
      allowedTargets: ['github.com', 'github-enterprise.example.com']
      allowRepoSelection: true
      git:
        repoUrl: github.com?owner=vrabbi-tap&repo=acc-v2-poc
        targetBranch: main
```
The final section which needs attention for XRD ingestion, is how often to sync XRDs from the attached clusters. This should be carefully thought about in production environments balancing the freshness of the catalog with added API load on the Kubernetes server needed in order to sync the resources.
```yaml
kubernetesIngestor:
  xrds:
    taskRunner:
      frequency: 120
      timeout: 600
```

#### Workload Components Auto Generation
Here we can set how often the Kubernetes API should be queried for resources. This should be considered greatly and the right balance for your environment should be considered based on frequency of changes, and the load on the K8s API server.
We can also set an array of namespaces we dont want to ingest resources from.
If you do not want to ingest all resources you can change "onlyIngestAnnotatedResources" to true, and then only workloads with the annotation "terasky.backstage.io/add-to-catalog" set to true will be added to the backstage catalog.
```yaml
kubernetesIngestor:
  components:
    taskRunner:
      frequency: 120 # Seconds
      timeout: 600 # Seconds
    excludedNamespaces:
      - kube-public
      - kube-system
      - default
    onlyIngestAnnotatedResources: false
```
These are only part of the options, so for more advanced use cases check out the plugin docs directly.

#### Crossplane Claim Components Auto Generation
This section has a very simple configuration schema. if set to ingest all claims, then all claims will be ingested. if set to false, only claims with the annotation "terasky.backstage.io/add-to-catalog" set to "true" will be added to backstage.
```yaml
kubernetesIngestor:
  crossplane:
    claims:
      ingestAllClaims: true
```

### DevPod Settings (Optional)
The plugin has vscode as the default IDE setup. if you want to change the IDE that is used as the default:
```yaml
devpod:
  defaultIDE: # supported values are vscode, clion, cursor, fleet, goland, intellij, jupyternotebook, openvscode, phpstorm, pycharm, rider, rubymine, rustrover, vscode-insiders, and webstorm
```
### ScaleOps Settings
The Scalops plugin requires adding a proxy endpoint in the app-config as well as a dedicated section for scaleops:

The proxy section should look like this:
```yaml
proxy:
  endpoints:
    '/scaleops':
      target: 'URL OF YOUR SCALEOPS INSTANCE'
      changeOrigin: true
```
The dedicated ScaleOps section should look like the following:
```yaml
scaleops:
  baseUrl: url for your scaleops instance
  linkToDashboard: true
  authentication: 
    enabled: false # if set to true additional config is documented in the plugins readme.
```

## Running your IDP
```bash
yarn dev
```

Enjoy!