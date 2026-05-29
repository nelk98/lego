declare module 'qz-tray' {
  type QzPrintData = Record<string, unknown>
  type QzConfig = Record<string, unknown>

  namespace qz {
    namespace websocket {
      function connect(options?: Record<string, unknown>): Promise<void>
      function disconnect(): Promise<void>
      function isActive(): boolean
    }

    namespace printers {
      function find(query?: string): Promise<string[]>
      function getDefault(): Promise<string | null>
    }

    namespace configs {
      function create(printer: string, options?: Record<string, unknown>): QzConfig
    }

    function print(config: QzConfig, data: QzPrintData[]): Promise<void>

    namespace security {
      function setCertificatePromise(
        handler: (resolve: (value?: string) => void, reject: (err?: Error) => void) => void
      ): void
      function setSignaturePromise(
        handler: (
          toSign: string
        ) => (resolve: (value?: string) => void, reject: (err?: Error) => void) => void
      ): void
    }
  }

  export default qz
}
