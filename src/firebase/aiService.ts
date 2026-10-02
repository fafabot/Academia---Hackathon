import { getAI, getGenerativeModel, GoogleAIBackend } from 'firebase/ai';
import { app } from './config';

const ai = getAI(app, { backend: new GoogleAIBackend() });

const model = getGenerativeModel(ai, {
  model: 'gemini-3.8-flash',
  systemInstruction: {
    role: 'model',
    parts: [{
      text: 'Você é o Bodyfit, assistente virtual da Bodyfit. Responda em português do Brasil, de forma simples, amigável e objetiva. Ajude com dúvidas sobre alimentação, exercícios, hábitos e uso da Bodyfit. Não substitua médico, nutricionista ou outro profissional de saúde. Quando analisar uma foto de comida, identifique os alimentos visíveis, estime as porções quando houver indícios visuais e estime calorias, proteínas, carboidratos e gorduras. Deixe claro que são estimativas e que uma foto não permite medir exatamente o peso. Se não conseguir identificar algo, diga isso em vez de inventar.'
    }]
  },
  generationConfig: {
    temperature: 0.4,
    maxOutputTokens: 700
  }
});

export const createBodyfitChat = () => model.startChat();

const fileToGenerativePart = async (file: File) => {
  const base64EncodedData = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      if (typeof result !== 'string') {
        reject(new Error('Não foi possível ler a imagem.'));
        return;
      }
      resolve(result.split(',')[1]);
    };
    reader.onerror = () => reject(new Error('Não foi possível ler a imagem.'));
    reader.readAsDataURL(file);
  });

  return {
    inlineData: {
      data: base64EncodedData,
      mimeType: file.type
    }
  };
};

export const sendBodyfitMessage = async (chat: ReturnType<typeof createBodyfitChat>, message: string) => {
  const result = await chat.sendMessage(message);
  return result.response.text();
};

export const analyzeFoodImage = async (
  chat: ReturnType<typeof createBodyfitChat>,
  file: File,
  extraMessage?: string
) => {
  const imagePart = await fileToGenerativePart(file);
  const prompt = extraMessage?.trim()
    ? extraMessage
    : 'Analise esta foto de comida. Identifique os alimentos visíveis e faça uma estimativa de calorias e macronutrientes. Organize por alimento e mostre um total estimado. Explique que os valores podem variar porque o peso e os ingredientes não podem ser medidos com precisão pela foto.';
  const result = await chat.sendMessage([prompt, imagePart]);
  return result.response.text();
};
