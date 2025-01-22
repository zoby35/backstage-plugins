package main

import (
	"flag"
	"fmt"
	"os"
	"strings"

	"gopkg.in/yaml.v3"
)

// Config structs
type Config struct {
	App               AppConfig              `yaml:"app"`
	Organization      OrgConfig             `yaml:"organization"`
	Backend           BackendConfig          `yaml:"backend"`
	Integrations      IntegrationsConfig     `yaml:"integrations"`
	Proxy             *ProxyConfig            `yaml:"proxy"`
	Techdocs          TechdocsConfig         `yaml:"techdocs"`
	Auth              AuthConfig             `yaml:"auth"`
	Scaffolder        ScaffolderConfig       `yaml:"scaffolder"`
	Catalog           CatalogConfig          `yaml:"catalog"`
	KubernetesIngestor *KubernetesIngestorConfig `yaml:"kubernetesIngestor,omitempty"`
	Kubernetes        *KubernetesConfig          `yaml:"kubernetes,omitempty"`
	Scaleops          *ScaleopsConfig         `yaml:"scaleops"`
	Crossplane        *CrossplaneConfig          `yaml:"crossplane,omitempty"`
	Kyverno           *KyvernoConfig             `yaml:"kyverno,omitempty"`
	Permission        PermissionConfig       `yaml:"permission"`
	Devpod            *DevpodConfig              `yaml:"devpod,omitempty"`
}

type AppConfig struct {
	Title   string `yaml:"title"`
	BaseUrl string `yaml:"baseUrl"`
}

type OrgConfig struct {
	Name string `yaml:"name"`
}

type BackendConfig struct {
	BaseUrl   string         `yaml:"baseUrl"`
	Listen    ListenConfig   `yaml:"listen"`
	CSP       CSPConfig      `yaml:"csp"`
	CORS      CORSConfig     `yaml:"cors"`
	Database  DatabaseConfig `yaml:"database"`
	Reading   ReadingConfig  `yaml:"reading"`
}

type ListenConfig struct {
	Port string `yaml:"port"`
}

type CSPConfig struct {
	ConnectSrc []string `yaml:"connect-src"`
}

type CORSConfig struct {
	Origin      string   `yaml:"origin"`
	Methods     []string `yaml:"methods"`
	Credentials bool     `yaml:"credentials"`
}

type DatabaseConfig struct {
	Client     string `yaml:"client"`
	Connection string `yaml:"connection"`
}

type ReadingConfig struct {
	Allow []AllowConfig `yaml:"allow"`
}

type AllowConfig struct {
	Host string `yaml:"host"`
}

type IntegrationsConfig struct {
	Github []GithubIntegrationConfig `yaml:"github"`
}

type GithubIntegrationConfig struct {
	Host  string `yaml:"host"`
	Token string `yaml:"token"`
}

type ProxyConfig struct {
	Endpoints map[string]EndpointConfig `yaml:"endpoints"`
}

type EndpointConfig struct {
	Target       string `yaml:"target"`
	ChangeOrigin bool   `yaml:"changeOrigin"`
}

type TechdocsConfig struct {
	Builder   string           `yaml:"builder"`
	Generator GeneratorConfig  `yaml:"generator"`
	Publisher PublisherConfig `yaml:"publisher"`
}

type GeneratorConfig struct {
	RunIn string `yaml:"runIn"`
}

type PublisherConfig struct {
	Type string `yaml:"type"`
}

type AuthConfig struct {
	Environment string                  `yaml:"environment"`
	Providers   map[string]interface{} `yaml:"providers"`
}

type ScaffolderConfig struct {
}

type CatalogConfig struct {
	Providers CatalogProvidersConfig `yaml:"providers"`
	Import    ImportConfig           `yaml:"import"`
	Rules     []RuleConfig          `yaml:"rules"`
	Locations []LocationConfig      `yaml:"locations"`
}

type CatalogProvidersConfig struct {
	MicrosoftGraphOrg map[string]MSGraphConfig `yaml:"microsoftGraphOrg"`
}

type MSGraphConfig struct {
	ClientId     string              `yaml:"clientId"`
	ClientSecret string              `yaml:"clientSecret"`
	TenantId     string              `yaml:"tenantId"`
	User         MSGraphUserConfig   `yaml:"user"`
	Schedule     MSGraphScheduleConfig `yaml:"schedule"`
}

type MSGraphUserConfig struct {
	Filter string `yaml:"filter"`
}

type MSGraphScheduleConfig struct {
	Frequency string `yaml:"frequency"`
	Timeout   string `yaml:"timeout"`
}

type ImportConfig struct {
	EntityFilename         string `yaml:"entityFilename"`
	PullRequestBranchName string `yaml:"pullRequestBranchName"`
}

type RuleConfig struct {
	Allow []string `yaml:"allow"`
}

type LocationConfig struct {
	Type   string      `yaml:"type"`
	Target string      `yaml:"target"`
	Rules  []RuleConfig `yaml:"rules,omitempty"`
}

type KubernetesIngestorConfig struct {
	Mappings   MappingsConfig   `yaml:"mappings"`
	Components ComponentsConfig `yaml:"components"`
	Crossplane CrossplaneIngestorConfig `yaml:"crossplane"`
}

type MappingsConfig struct {
	NamespaceModel         string `yaml:"namespaceModel"`
	NameModel              string `yaml:"nameModel"`
	TitleModel             string `yaml:"titleModel"`
	SystemModel            string `yaml:"systemModel"`
	ReferencesNamespaceModel string `yaml:"referencesNamespaceModel"`
}

type ComponentsConfig struct {
	Enabled                     bool     `yaml:"enabled"`
	TaskRunner                  TaskRunnerConfig `yaml:"taskRunner"`
	ExcludedNamespaces         []string `yaml:"excludedNamespaces"`
	CustomWorkloadTypes        []CustomWorkloadType `yaml:"customWorkloadTypes"`
	DisableDefaultWorkloadTypes bool     `yaml:"disableDefaultWorkloadTypes"`
	OnlyIngestAnnotatedResources bool     `yaml:"onlyIngestAnnotatedResources"`
}

type TaskRunnerConfig struct {
	Frequency int `yaml:"frequency"`
	Timeout   int `yaml:"timeout"`
}

type CustomWorkloadType struct {
	Group      string `yaml:"group"`
	ApiVersion string `yaml:"apiVersion"`
	Plural     string `yaml:"plural"`
}

type CrossplaneIngestorConfig struct {
	Claims CrossplaneClaimsConfig `yaml:"claims"`
	Xrds   CrossplaneXrdsConfig  `yaml:"xrds"`
}

type CrossplaneClaimsConfig struct {
	IngestAllClaims bool `yaml:"ingestAllClaims"`
}

type CrossplaneXrdsConfig struct {
	ConvertDefaultValuesToPlaceholders bool              `yaml:"convertDefaultValuesToPlaceholders"`
	Enabled                           bool              `yaml:"enabled"`
	PublishPhase                      PublishPhaseConfig `yaml:"publishPhase"`
	TaskRunner                        TaskRunnerConfig   `yaml:"taskRunner"`
	IngestAllXRDs                     bool              `yaml:"ingestAllXRDs"`
}

type PublishPhaseConfig struct {
	AllowRepoSelection bool     `yaml:"allowRepoSelection"`
	AllowedTargets     []string `yaml:"allowedTargets"`
	Target             string   `yaml:"target"`
	Git                GitConfig `yaml:"git"`
}

type GitConfig struct {
	RepoUrl      string `yaml:"repoUrl"`
	TargetBranch string `yaml:"targetBranch"`
}

type KubernetesConfig struct {
	Frontend              K8sFrontendConfig `yaml:"frontend"`
	ServiceLocatorMethod ServiceLocatorMethodConfig `yaml:"serviceLocatorMethod"`
	ClusterLocatorMethods []ClusterLocatorMethodConfig `yaml:"clusterLocatorMethods"`
}

type K8sFrontendConfig struct {
	PodDelete PodDeleteConfig `yaml:"podDelete"`
}

type PodDeleteConfig struct {
	Enabled bool `yaml:"enabled"`
}

type ServiceLocatorMethodConfig struct {
	Type string `yaml:"type"`
}

type ClusterLocatorMethodConfig struct {
	Type     string          `yaml:"type"`
	Clusters []ClusterConfig `yaml:"clusters"`
}

type ClusterConfig struct {
	Name               string `yaml:"name"`
	Url                string `yaml:"url"`
	AuthProvider       string `yaml:"authProvider"`
	ServiceAccountToken string `yaml:"serviceAccountToken"`
	SkipTLSVerify      bool   `yaml:"skipTLSVerify"`
}

type ScaleopsConfig struct {
	BaseUrl         string `yaml:"baseUrl"`
	CurrencyPrefix  string `yaml:"currencyPrefix"`
	LinkToDashboard bool   `yaml:"linkToDashboard"`
	Authentication  AuthenticationConfig `yaml:"authentication"`
}

type AuthenticationConfig struct {
	Enabled bool `yaml:"enabled"`
}

type CrossplaneConfig struct {
	EnablePermissions bool `yaml:"enablePermissions"`
}

type KyvernoConfig struct {
	EnablePermissions bool `yaml:"enablePermissions"`
}

type PermissionConfig struct {
	Enabled bool                `yaml:"enabled"`
	Rbac    RbacPermissionConfig `yaml:"rbac"`
}

type RbacPermissionConfig struct {
	PoliciesCSVFile        string   `yaml:"policies-csv-file"`
	PolicyFileReload       bool     `yaml:"policyFileReload"`
	PluginsWithPermission []string `yaml:"pluginsWithPermission"`
	Admin                 AdminConfig `yaml:"admin"`
	SuperAdmin            AdminConfig `yaml:"superAdmin"`
}

type AdminConfig struct {
	Users []UserConfig `yaml:"users"`
}

type UserConfig struct {
	Name string `yaml:"name"`
}

type DevpodConfig struct {
	DefaultIDE string `yaml:"defaultIDE"`
}

// Helper functions for prompting
func promptString(prompt string, defaultVal string) string {
	if defaultVal != "" {
		fmt.Printf("%s [%s]: ", prompt, defaultVal)
	} else {
		fmt.Printf("%s: ", prompt)
	}
	var input string
	fmt.Scanln(&input)
	if input == "" {
		return defaultVal
	}
	return input
}

func promptBool(prompt string, defaultVal bool) bool {
	defaultStr := "n"
	if defaultVal {
		defaultStr = "y"
	}
	fmt.Printf("%s (y/n) [%s]: ", prompt, defaultStr)
	var input string
	fmt.Scanln(&input)
	if input == "" {
		return defaultVal
	}
	return input == "y" || input == "Y"
}

func promptStringSlice(prompt string, defaultVals []string) []string {
	if len(defaultVals) > 0 {
		fmt.Printf("%s [%s]: ", prompt, strings.Join(defaultVals, ","))
	} else {
		fmt.Printf("%s (comma-separated): ", prompt)
	}
	var input string
	fmt.Scanln(&input)
	if input == "" {
		return defaultVals
	}
	return strings.Split(input, ",")
}

// Configuration getter functions
func getAppConfig() AppConfig {
	fmt.Println("")
	fmt.Println("General App Configurations")
	fmt.Println("==========================")
	return AppConfig{
		Title:   promptString("Enter application title", "TeraSky OSS Backstage"),
		BaseUrl: promptString("Enter frontend base URL", "http://localhost:3000"),
	}
}

func getBackendConfig() BackendConfig {
	fmt.Println("")
	fmt.Println("Backend Configurations")
	fmt.Println("=====================")
	port := promptString("Enter backend port", "7007")
	baseUrl := promptString("Enter backend base URL", fmt.Sprintf("http://localhost:%s", port))

	return BackendConfig{
		BaseUrl: baseUrl,
		Listen: ListenConfig{
			Port: port,
		},
		CSP: CSPConfig{
			ConnectSrc: []string{"'self'", "http:", "https:"},
		},
		CORS: CORSConfig{
			Origin:      "http://localhost:3000",
			Methods:     []string{"GET", "HEAD", "PATCH", "POST", "PUT", "DELETE"},
			Credentials: true,
		},
		Database: DatabaseConfig{
			Client:     "better-sqlite3",
			Connection: ":memory:",
		},
		Reading: ReadingConfig{
			Allow: []AllowConfig{
				{Host: "raw.githubusercontent.com"},
			},
		},
	}
}

func getGithubIntegrationConfig() IntegrationsConfig {
	fmt.Println("")
	fmt.Println("Source Control Integration Configurations")
	fmt.Println("========================================")
	if !promptBool("Configure GitHub integration?", true) {
		return IntegrationsConfig{}
	}

	token := promptString("Enter GitHub PAT", "")
	return IntegrationsConfig{
		Github: []GithubIntegrationConfig{
			{
				Host:  "github.com",
				Token: token,
			},
		},
	}
}

func getAuthConfig() AuthConfig {
	fmt.Println("")
	fmt.Println("Authentication Configurations")
	fmt.Println("===========================")
	providers := make(map[string]interface{})

	if promptBool("Configure Microsoft authentication?", false) {
		providers["microsoft"] = map[string]interface{}{
			"development": map[string]interface{}{
				"clientId":     promptString("Enter Microsoft client ID", ""),
				"clientSecret": promptString("Enter Microsoft client secret", ""),
				"tenantId":     promptString("Enter Microsoft tenant ID", ""),
				"domainHint":   promptString("Enter Microsoft domain hint", ""),
			},
		}
	}

	if promptBool("Configure GitHub authentication?", false) {
		providers["github"] = map[string]interface{}{
			"development": map[string]interface{}{
				"clientId":     promptString("Enter GitHub client ID", ""),
				"clientSecret": promptString("Enter GitHub client secret", ""),
			},
		}
	}

	return AuthConfig{
		Environment: "development",
		Providers:   providers,
	}
}

func getCatalogConfig() CatalogConfig {
	fmt.Println("")
	fmt.Println("Catalog Configurations")
	fmt.Println("=====================")
	msGraphConfig := make(map[string]MSGraphConfig)

	if promptBool("Configure Microsoft Graph integration?", false) {
		msGraphConfig["default"] = MSGraphConfig{
			ClientId:     promptString("Enter Microsoft Graph client ID", ""),
			ClientSecret: promptString("Enter Microsoft Graph client secret", ""),
			TenantId:     promptString("Enter Microsoft Graph tenant ID", ""),
			User: MSGraphUserConfig{
				Filter: "accountEnabled eq true and userType eq 'member'",
			},
			Schedule: MSGraphScheduleConfig{
				Frequency: "PT1H",
				Timeout:   "PT50M",
			},
		}
	}

	return CatalogConfig{
		Providers: CatalogProvidersConfig{
			MicrosoftGraphOrg: msGraphConfig,
		},
		Import: ImportConfig{
			EntityFilename:         "catalog-info.yaml",
			PullRequestBranchName: "backstage-integration",
		},
		Rules: []RuleConfig{
			{Allow: []string{"Component", "System", "API", "Resource", "Location", "Template"}},
		},
		Locations: []LocationConfig{
			{
				Type:   "file",
				Target: "../../examples/entities.yaml",
			},
			{
				Type:   "file",
				Target: "../../examples/template/template.yaml",
				Rules:  []RuleConfig{{Allow: []string{"Template"}}},
			},
			{
				Type:   "file",
				Target: "../../examples/org.yaml",
				Rules:  []RuleConfig{{Allow: []string{"User", "Group"}}},
			},
		},
	}
}

func getKubernetesConfig() *KubernetesConfig {
	fmt.Println("")
	fmt.Println("Kubernetes Configurations")
	fmt.Println("=========================")
	if !promptBool("Configure Kubernetes integration?", false) {
		return nil
	}

	var clusters []ClusterConfig
	for promptBool("Add a Kubernetes cluster?", true) {
		cluster := ClusterConfig{
			Name:          promptString("Enter cluster name", ""),
			Url:           promptString("Enter cluster URL", ""),
			AuthProvider:  promptString("Enter auth provider (serviceAccount/oidc)", "serviceAccount"),
			SkipTLSVerify: promptBool("Skip TLS verification?", false),
		}

		if cluster.AuthProvider == "serviceAccount" {
			cluster.ServiceAccountToken = promptString("Enter service account token", "")
		}

		clusters = append(clusters, cluster)
	}

	return &KubernetesConfig{
		Frontend: K8sFrontendConfig{
			PodDelete: PodDeleteConfig{
				Enabled: true,
			},
		},
		ServiceLocatorMethod: ServiceLocatorMethodConfig{
			Type: "multiTenant",
		},
		ClusterLocatorMethods: []ClusterLocatorMethodConfig{
			{
				Type:     "config",
				Clusters: clusters,
			},
		},
	}
}

func getKubernetesIngestorConfig() *KubernetesIngestorConfig {
	fmt.Println("")
	fmt.Println("Kubernetes Ingestor Configurations")
	fmt.Println("==================================")
	if !promptBool("Configure Kubernetes Ingestor?", false) {
		return nil
	}
	fmt.Println("")
	fmt.Println("Kubernetes To Backstage Mappings Configurations")
	fmt.Println("================================================")
	mappings := MappingsConfig{
		NamespaceModel:           promptString("Enter namespace model (cluster/namespace/default)", "default"),
		NameModel:                promptString("Enter name model (name-cluster/name-namespace/name)", "name-cluster"),
		TitleModel:               promptString("Enter title model (name/name-cluster/name-namespace)", "name"),
		SystemModel:              promptString("Enter system model (cluster/namespace/cluster-namespace/default)", "cluster-namespace"),
		ReferencesNamespaceModel: promptString("Enter references namespace model (default/same)", "default"),
	}
	fmt.Println("")
	fmt.Println("Kubernetes Workloads Component Generation Configurations")
	fmt.Println("=========================================================")
	components := ComponentsConfig{
		Enabled: promptBool("Enable components?", true),
		TaskRunner: TaskRunnerConfig{
			Frequency: 10,
			Timeout:   600,
		},
		ExcludedNamespaces:          promptStringSlice("Enter excluded namespaces", []string{"kube-public", "kube-system", "default"}),
		DisableDefaultWorkloadTypes: promptBool("Disable default workload types?", false),
		OnlyIngestAnnotatedResources: promptBool("Only ingest annotated resources?", false),
	}
	fmt.Println("")
	fmt.Println("Custom Workload Types Configurations")
	fmt.Println("==================================")
	if promptBool("Add custom workload types?", false) {
		for promptBool("Add another custom workload type?", true) {
			components.CustomWorkloadTypes = append(components.CustomWorkloadTypes, CustomWorkloadType{
				Group:      promptString("Enter group", ""),
				ApiVersion: promptString("Enter API version", ""),
				Plural:     promptString("Enter plural", ""),
			})
		}
	}
	fmt.Println("")
	fmt.Println("Crossplane Ingestion Configurations")
	fmt.Println("====================================")
	crossplane := CrossplaneIngestorConfig{
		Claims: CrossplaneClaimsConfig{
			IngestAllClaims: promptBool("Ingest all claims?", true),
		},
		Xrds: CrossplaneXrdsConfig{
			ConvertDefaultValuesToPlaceholders: promptBool("Convert default values to placeholders?", true),
			Enabled:                           promptBool("Enable XRDs?", true),
			IngestAllXRDs:                     promptBool("Ingest all XRDs?", true),
			TaskRunner: TaskRunnerConfig{
				Frequency: 10,
				Timeout:   600,
			},
			PublishPhase: PublishPhaseConfig{
				AllowRepoSelection: promptBool("Allow repo selection?", false),
				AllowedTargets:     promptStringSlice("Enter allowed targets", []string{"github.com", "gitlab.com"}),
				Target:             promptString("Enter target", "github"),
				Git: GitConfig{
					RepoUrl:      promptString("Enter Git repo URL", "github.com?owner=vrabbi-tap&repo=acc-v2-poc"),
					TargetBranch: promptString("Enter target branch", "main"),
				},
			},
		},
	}

	return &KubernetesIngestorConfig{
		Mappings:   mappings,
		Components: components,
		Crossplane: crossplane,
	}
}

func getScaleopsConfig() *ScaleopsConfig {
	fmt.Println("")
	fmt.Println("ScaleOps Configurations")
	fmt.Println("=====================")
	if !promptBool("Configure ScaleOps?", false) {
		return nil
	}

	return &ScaleopsConfig{
		BaseUrl:         promptString("Enter ScaleOps base URL", "http://scaleops.10.100.148.235.nip.io"),
		CurrencyPrefix:  promptString("Enter currency prefix", "$"),
		LinkToDashboard: promptBool("Enable dashboard linking?", true),
		Authentication: AuthenticationConfig{
			Enabled: promptBool("Enable authentication?", false),
		},
	}
}

func getProxyConfig() *ProxyConfig {
	fmt.Println("")
	fmt.Println("Backstage Backend Proxy Configurations")
	fmt.Println("========================================")
	if !promptBool("Configure proxy endpoints?", false) {
		return nil
	}

	endpoints := make(map[string]EndpointConfig)
	for promptBool("Add proxy endpoint?", true) {
		path := promptString("Enter endpoint path (e.g., /scaleops)", "/scaleops")
		endpoints[path] = EndpointConfig{
			Target:       promptString("Enter target URL", ""),
			ChangeOrigin: promptBool("Enable change origin?", true),
		}
	}

	return &ProxyConfig{
		Endpoints: endpoints,
	}
}

func getCrossplaneConfig() *CrossplaneConfig {
	fmt.Println("")
	fmt.Println("Crossplane Visualization Configurations")
	fmt.Println("========================================")
	if !promptBool("Configure Crossplane?", false) {
		return nil
	}
	return &CrossplaneConfig{
		EnablePermissions: promptBool("Enable Crossplane permissions?", true),
	}
}

func getKyvernoConfig() *KyvernoConfig {
	fmt.Println("")
	fmt.Println("Kyverno Policy Report Configurations")
	fmt.Println("========================================")
	if !promptBool("Configure Kyverno?", false) {
		return nil
	}
	return &KyvernoConfig{
		EnablePermissions: promptBool("Enable Kyverno permissions?", true),
	}
}

func getDetailedPermissionConfig() PermissionConfig {
	fmt.Println("")
	fmt.Println("Permission Framework Configurations")
	fmt.Println("========================================================")
	if !promptBool("Configure permissions?", false) {
		return PermissionConfig{}
	}
	fmt.Println("")
	fmt.Println("RBAC Plugin Configurations")
	fmt.Println("==========================")
	rbac := RbacPermissionConfig{
		PoliciesCSVFile:  promptString("Enter policies CSV file path", "/home/vrabbi/crossplane/bakstage-plugins/permissions.csv"),
		PolicyFileReload: promptBool("Enable policy file reload?", true),
		PluginsWithPermission: promptStringSlice("Enter plugins with permission", []string{
			"catalog", "permission", "kubernetes", "crossplane", "scaffolder", "kyverno",
		}),
	}

	// Admin users
	fmt.Println("\nConfiguring admin users:")
	var adminUsers []UserConfig
	for promptBool("Add admin user?", true) {
		adminUsers = append(adminUsers, UserConfig{
			Name: promptString("Enter admin user name (e.g., user:default/username)", ""),
		})
	}
	rbac.Admin = AdminConfig{Users: adminUsers}

	// Super admin users
	fmt.Println("\nConfiguring super admin users:")
	var superAdminUsers []UserConfig
	for promptBool("Add super admin user?", true) {
		superAdminUsers = append(superAdminUsers, UserConfig{
			Name: promptString("Enter super admin user name (e.g., user:default/username)", ""),
		})
	}
	rbac.SuperAdmin = AdminConfig{Users: superAdminUsers}

	return PermissionConfig{
		Enabled: true,
		Rbac:    rbac,
	}
}

func getDevpodConfig() *DevpodConfig {
	fmt.Println("")
	fmt.Println("Devpod Configurations")
	fmt.Println("=====================")
	if !promptBool("Configure Devpod?", false) {
		return nil
	}

	return &DevpodConfig{
		DefaultIDE: promptString("Enter default IDE", "webstorm"),
	}
}

func main() {
	outputFile := flag.String("output", "", "Output file path (defaults to stdout)")
	flag.Parse()

	config := Config{
		App:                getAppConfig(),
		Organization:       OrgConfig{Name: promptString("Enter organization name", "TeraSky")},
		Backend:           getBackendConfig(),
		Auth:              getAuthConfig(),
		Integrations:      getGithubIntegrationConfig(),
		Catalog:           getCatalogConfig(),
		Techdocs: TechdocsConfig{
			Builder: "local",
			Generator: GeneratorConfig{
				RunIn: "docker",
			},
			Publisher: PublisherConfig{
				Type: "local",
			},
		},
		Kubernetes:        getKubernetesConfig(),
		KubernetesIngestor: getKubernetesIngestorConfig(),
		Scaleops:          getScaleopsConfig(),
		Proxy:             getProxyConfig(),
		Devpod:           getDevpodConfig(),
		Permission:        getDetailedPermissionConfig(),
		Crossplane:        getCrossplaneConfig(),
		Kyverno:           getKyvernoConfig(),
	}

	yamlData, err := yaml.Marshal(&config)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error marshaling YAML: %v\n", err)
		os.Exit(1)
	}

	if *outputFile == "" {
		fmt.Println(string(yamlData))
	} else {
		err := os.WriteFile(*outputFile, yamlData, 0644)
		if err != nil {
			fmt.Fprintf(os.Stderr, "Error writing file: %v\n", err)
			os.Exit(1)
		}
		fmt.Printf("Configuration written to %s\n", *outputFile)
	}
}
