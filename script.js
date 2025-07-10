const apiKeyInput = document.getElementById('apiKey');
const gameSelect = document.getElementById('gameSelect');
const questionInput = document.getElementById('question');
const askButton = document.getElementById('askButton');
const aiResponse = document.getElementById('aiResponse');
const form = document.getElementById('form');

const markdownToHTML = (text) => {
    const converter = new showdown.Converter()
    return converter.makeHtml(text)
}


const askAI = async (question, game, apiKey) => {
    const model = "gemini-2.5-flash"
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
    
    const pergunta = `
        ##Especialidade
        Você é especialista assistente de meta para o jogo ${game}

        ##Tarefa
        Você deve responder as perguntas do usuário com base no seu conhecimento do jogo, estratégias, builds, e dicas

        ##Regras
        - Se você não sabe a resposta, responda com 'Não sei', e não tente inventar uma resposta

        - Se a pergunta não está relacionada ao jogo, responda com 'Esta pergunta não está relacionada ao jogo'

        - Considere a data atual ${new Date ().toLocaleDateString()}

        -Faça pesquisas atualizadas sobre o patch atual, baseado na data atual ára dar uma resposra coerente.

        -Nunca responda itens que você não tenha certeza de que existe no patch atual.

        ##Resposta
        - Economize na resposta, seja direto, responda no máximo 500 caracteres

        - Responda em markdown

        - Não precisa fazer saudações ou despedidas, responda apenas o que o usuário está perguntando 

        ##Exemplo de Resposta

        Pergunta do usuário: melhor build para teemo bot
        Resposta: A Build mais atual é: \n\n **Itens** \n\n coloque os itens aqui. \n\n **Runas** \n\n exemplo de runas\n\n
        ---

        Aqui está a pergunta do usuário: ${question}
    `

    const content = [{
        role:"user",
        parts: [{ //array - lista []
            text: pergunta
        }]
    }]

    const tools = [{
        google_search:{}
    }]

    //chamada API
    const response = await fetch(geminiUrl, {
        method:'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            contents:content,
            tools
        })
    })

    const list = [true, false, false]

    const data = await response.json()
    return data.candidates [0].content.parts[0].text
    
}

const sendForm = async(event) => {
    event.preventDefault()
    const apiKey = apiKeyInput.value
    const game = gameSelect.value
    const question = questionInput.value



    if(apiKey == '' || game == '' || question == '') {
        alert('Por favor, preencha todos os campos')
        return

    }

    askButton.disabled = true
    askButton.textContent = 'Perguntando...'
    askButton.classList.add('loading')

    try{
        //Perguntar para a AI
        const text = await  askAI(question, game, apiKey)
       aiResponse.querySelector('.response-content').innerHTML = markdownToHTML(text)
       aiResponse.style.display = 'block'

    } catch(error) {
        console.log('Erro:', error)

    } finally {
        askButton.disabled = false
        askButton.textContent = "Perguntar"
        askButton.classList.remove('loading')
    }
}
form.addEventListener('submit', sendForm)
