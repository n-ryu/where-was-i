import { useState, useEffect } from 'react'
import styled from 'styled-components'
import * as settingsRepository from '../db/settingsRepository'

const Container = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 16px;
`

const Title = styled.h1`
  font-size: 24px;
  margin-bottom: 24px;
`

const Section = styled.section`
  background: white;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  border: 1px solid #e0e0e0;
`

const SectionTitle = styled.h2`
  font-size: 16px;
  margin-bottom: 16px;
  color: #333;
`

const FormGroup = styled.div`
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }
`

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
`

const Select = styled.select`
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  background: white;
`

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  box-sizing: border-box;
`

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 16px;
`

const Button = styled.button`
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
`

const PrimaryButton = styled(Button)`
  background: #1976d2;
  color: white;
  border: none;

  &:hover {
    background: #1565c0;
  }
`

const DangerButton = styled(Button)`
  background: #fff;
  color: #d32f2f;
  border: 1px solid #d32f2f;

  &:hover {
    background: #ffebee;
  }
`

const SuccessMessage = styled.div`
  color: #388e3c;
  background: #e8f5e9;
  padding: 12px;
  border-radius: 8px;
  margin-top: 16px;
  text-align: center;
`

export function SettingsPage() {
  const [apiProvider, setApiProvider] = useState('openai')
  const [apiKey, setApiKey] = useState('')
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadSettings = async () => {
      const provider = await settingsRepository.getSetting('apiProvider')
      const key = await settingsRepository.getSetting('apiKey')

      if (provider) setApiProvider(provider)
      if (key) setApiKey(key)
      setIsLoading(false)
    }

    loadSettings()
  }, [])

  const handleSave = async () => {
    await settingsRepository.setSetting('apiProvider', apiProvider)
    await settingsRepository.setSetting('apiKey', apiKey)
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 3000)
  }

  const handleDelete = async () => {
    await settingsRepository.deleteSetting('apiKey')
    setApiKey('')
  }

  if (isLoading) {
    return (
      <Container>
        <Title>설정</Title>
        <p>로딩 중...</p>
      </Container>
    )
  }

  return (
    <Container>
      <Title>설정</Title>

      <Section>
        <SectionTitle>AI API 설정</SectionTitle>

        <FormGroup>
          <Label htmlFor="apiProvider">API 프로바이더</Label>
          <Select
            id="apiProvider"
            value={apiProvider}
            onChange={(e) => setApiProvider(e.target.value)}
          >
            <option value="openai">OpenAI</option>
            <option value="anthropic">Anthropic</option>
          </Select>
        </FormGroup>

        <FormGroup>
          <Label htmlFor="apiKey">API 키</Label>
          <Input
            id="apiKey"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="API 키를 입력하세요"
          />
        </FormGroup>

        <ButtonGroup>
          <PrimaryButton onClick={handleSave}>저장</PrimaryButton>
          <DangerButton onClick={handleDelete}>삭제</DangerButton>
        </ButtonGroup>

        {saveSuccess && <SuccessMessage>설정이 저장되었습니다</SuccessMessage>}
      </Section>
    </Container>
  )
}
