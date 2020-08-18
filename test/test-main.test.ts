jest.mock('../src/krane')
jest.mock('../src/kube')
import {configureKube} from '../src/kube'
import {render, deploy} from '../src/krane'
import {mocked} from 'ts-jest/utils'

import {main} from '../src/main'

describe('main entry point', () => {
  test('Configures kube, renders and deploys', async () => {
    const currentSha: string = 'abc123'
    const dockerRegistry: string = 'dev.registry.example.com'
    const kubernetesServerRaw: string = ''
    const kubernetesContext: string = 'prod'
    const kubernetesClusterDomain: string = 'prod.example.com'
    const kubernetesNamespace: string = 'my-service'
    const kraneTemplateDir: string = 'kubernetes/production'
    const kraneSelector: string = 'managed-by=krane'
    const kranePath: string = 'krane'
    const extraBindingsRaw: string = '{}'

    const renderedTemplates: string = 'rendered templates'
    mocked(render).mockImplementation(async () => {
      return renderedTemplates
    })

    await main(
      currentSha,
      dockerRegistry,
      kubernetesServerRaw,
      kubernetesContext,
      kubernetesClusterDomain,
      kubernetesNamespace,
      kraneTemplateDir,
      kraneSelector,
      kranePath,
      extraBindingsRaw
    )

    const kubernetesServer = `https://${kubernetesClusterDomain}:6443`
    expect(configureKube).toHaveBeenCalledTimes(1)
    expect(configureKube).toHaveBeenCalledWith(
      kubernetesServer,
      kubernetesContext,
      kubernetesNamespace
    )

    const extraBindings: Record<string, string> = {}
    expect(render).toHaveBeenCalledTimes(1)
    expect(render).toHaveBeenCalledWith(
      kranePath,
      currentSha,
      dockerRegistry,
      kubernetesClusterDomain,
      kraneTemplateDir,
      extraBindings
    )

    expect(deploy).toHaveBeenCalledTimes(1)
    expect(deploy).toHaveBeenCalledWith(
      kranePath,
      kubernetesContext,
      kubernetesNamespace,
      kraneSelector,
      kraneTemplateDir,
      renderedTemplates
    )
  })

  test('Configures kube, renders and deploys with custom server', async () => {
    const currentSha: string = 'abc123'
    const dockerRegistry: string = 'dev.registry.example.com'
    const kubernetesServerRaw: string = 'https://other.example.com:6443'
    const kubernetesContext: string = 'prod'
    const kubernetesClusterDomain: string = 'prod.example.com'
    const kubernetesNamespace: string = 'my-service'
    const kraneTemplateDir: string = 'kubernetes/production'
    const kraneSelector: string = 'managed-by=krane'
    const kranePath: string = 'krane'
    const extraBindingsRaw: string = '{}'

    const renderedTemplates: string = 'rendered templates'
    mocked(render).mockImplementation(async () => {
      return renderedTemplates
    })

    await main(
      currentSha,
      dockerRegistry,
      kubernetesServerRaw,
      kubernetesContext,
      kubernetesClusterDomain,
      kubernetesNamespace,
      kraneTemplateDir,
      kraneSelector,
      kranePath,
      extraBindingsRaw
    )

    expect(configureKube).toHaveBeenCalledTimes(1)
    expect(configureKube).toHaveBeenCalledWith(
      kubernetesServerRaw,
      kubernetesContext,
      kubernetesNamespace
    )

    const extraBindings: Record<string, string> = {}
    expect(render).toHaveBeenCalledTimes(1)
    expect(render).toHaveBeenCalledWith(
      kranePath,
      currentSha,
      dockerRegistry,
      kubernetesClusterDomain,
      kraneTemplateDir,
      extraBindings
    )

    expect(deploy).toHaveBeenCalledTimes(1)
    expect(deploy).toHaveBeenCalledWith(
      kranePath,
      kubernetesContext,
      kubernetesNamespace,
      kraneSelector,
      kraneTemplateDir,
      renderedTemplates
    )
  })

  test('Validates JSON bindings', async () => {
    const currentSha: string = 'abc123'
    const dockerRegistry: string = 'dev.registry.example.com'
    const kubernetesServerRaw: string = ''
    const kubernetesContext: string = 'prod'
    const kubernetesClusterDomain: string = 'prod.example.com'
    const kubernetesNamespace: string = 'my-service'
    const kraneTemplateDir: string = 'kubernetes/production'
    const kraneSelector: string = 'managed-by=krane'
    const kranePath: string = 'krane'
    const extraBindingsRaw: string = '{'

    await expect(
      main(
        currentSha,
        dockerRegistry,
        kubernetesServerRaw,
        kubernetesContext,
        kubernetesClusterDomain,
        kubernetesNamespace,
        kraneTemplateDir,
        kraneSelector,
        kranePath,
        extraBindingsRaw
      )
    ).rejects.toThrow(/^Unexpected end of JSON/)

    expect(configureKube).toHaveBeenCalledTimes(0)
    expect(render).toHaveBeenCalledTimes(0)
    expect(deploy).toHaveBeenCalledTimes(0)
  })
})
