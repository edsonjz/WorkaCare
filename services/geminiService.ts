import { GoogleGenerativeAI } from "@google/generative-ai";
import { AnalysisReport, KPIMetric, ChartDataPoint } from '../types';

const getClient = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
  if (!apiKey || apiKey === 'SUA_CHAVE_AQUI') return null;
  return new GoogleGenerativeAI(apiKey);
};

export const analyzeWellbeingData = async (
  kpis: KPIMetric[],
  trends: ChartDataPoint[]
): Promise<AnalysisReport> => {
  const genAI = getClient();

  if (!genAI) {
    return {
      summary: "Modo de demonstração: Configure a VITE_GEMINI_API_KEY no arquivo .env.local para análises reais.",
      recommendations: [
        "Inicie a coleta de feedback via questionários.",
        "Promova sessões de check-in iniciais.",
        "Defina objetivos claros de bem-estar."
      ],
      riskLevel: "low"
    };
  }

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
  });

  const prompt = `
    Aja como um especialista sênior em Psicologia Organizacional e Recursos Humanos.
    Analise os seguintes dados de bem-estar de uma empresa:
    
    KPIs Atuais:
    ${JSON.stringify(kpis)}
    
    Tendência últimos 6 meses (Mental, Físico, Social):
    ${JSON.stringify(trends)}
    
    Forneça uma resposta estritamente em formato JSON com a seguinte estrutura:
    {
      "summary": "Um resumo executivo de 2-3 frases.",
      "recommendations": ["Recomendação 1", "Recomendação 2", "Recomendação 3", "Recomendação 4"],
      "riskLevel": "low" | "medium" | "high"
    }
    
    Responda apenas o JSON, sem markdown ou textos adicionais.
    Responda em Português do Brasil.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Limpeza robusta de markdown se a IA ignorar o comando "apenas JSON"
    if (text.includes('```json')) {
      text = text.split('```json')[1].split('```')[0].trim();
    } else if (text.includes('```')) {
      text = text.split('```')[1].split('```')[0].trim();
    }

    return JSON.parse(text) as AnalysisReport;
  } catch (error: any) {
    console.error("Gemini API Error Detail:", error);

    // Tenta extrair mensagem de erro amigável
    let errorMsg = "Não foi possível gerar a análise. ";
    if (error.message?.includes('API_KEY_INVALID')) {
      errorMsg += "A chave de API fornecida parece inválida.";
    } else if (error.message?.includes('network')) {
      errorMsg += "Erro de conexão com a internet.";
    } else {
      errorMsg += "Verifique se a sua chave de API é válida e se o servidor foi reiniciado.";
    }

    return {
      summary: errorMsg,
      recommendations: [
        "Certifique-se de que a chave VITE_GEMINI_API_KEY está correta no .env.local",
        "Reinicie o servidor de desenvolvimento (pare o processo e rode npm run dev novamente)",
        "Verifique se o modelo gemini-1.5-flash está disponível na sua região."
      ],
      riskLevel: "low"
    };
  }
};