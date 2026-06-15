declare const styleConfig: {
  sharedSassVariablesPath: string
  sharedSassFunctionsPath: string
  sharedSassResources: string
  unoConfigFile: string
  withSharedSassResources: (source: string, filename?: string) => string
}

export = styleConfig
