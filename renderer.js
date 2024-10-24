// renderer.js - Electron Renderer Process
require.config({
    paths: {
        'vs': 'path/to/monaco-editor/min/vs'
    }
});

let editor;
const DEFAULT_LANGUAGE = 'plaintext';
const LANGUAGE_PATTERNS = {
    javascript: /^(const|let|var|function|class|import|export)/m,
    python: /^(def|class|import|from|if __name__)/m,
    html: /^<!DOCTYPE|<html|<head|<body/i,
    css: /^(\.|#|body|div|span|@media)/m,
};

class AIChat {
    constructor() {
        this.chatDisplay = document.getElementById('chat-display');
        this.chatInput = document.getElementById('chat-input');
        this.chatSubmit = document.getElementById('chat-submit');
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.chatSubmit.addEventListener('click', () => this.handleUserInput());
        this.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleUserInput();
            }
        });
    }

    async handleUserInput() {
        const userInput = this.chatInput.value.trim();
        if (!userInput) return;

        this.addMessage(userInput, 'user');
        this.chatInput.value = '';

        try {
            const response = await this.getAIResponse(userInput);
            this.addMessage(response, 'ai');
        } catch (error) {
            this.addMessage('Error: Unable to get AI response', 'error');
            console.error('AI Response Error:', error);
        }
    }

    addMessage(text, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;
        messageDiv.textContent = text;
        this.chatDisplay.appendChild(messageDiv);
        this.chatDisplay.scrollTop = this.chatDisplay.scrollHeight;
    }

    async getAIResponse(input) {
        // Implementation for both local and cloud AI
        try {
            // First try local LLaMA if available
            return await this.getLocalAIResponse(input);
        } catch (error) {
            // Fallback to Hugging Face API
            return await this.getCloudAIResponse(input);
        }
    }

    async getLocalAIResponse(input) {
        // Example implementation using child_process to communicate with local LLaMA
        return new Promise((resolve, reject) => {
            // Implementation would go here
            // For now, we'll reject to fall back to cloud
            reject(new Error('Local AI not implemented'));
        });
    }

    async getCloudAIResponse(input) {
        // Example implementation using Hugging Face API
        const API_URL = 'https://api-inference.huggingface.co/models/your-model';
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer YOUR_API_TOKEN',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ inputs: input }),
        });

        if (!response.ok) {
            throw new Error('Failed to get AI response');
        }

        const data = await response.json();
        return data[0].generated_text;
    }
}

class Editor {
    constructor() {
        this.setupMonacoEditor();
    }

    async setupMonacoEditor() {
        require(['vs/editor/editor.main'], () => {
            editor = monaco.editor.create(document.getElementById('editor-container'), {
                value: '',
                language: DEFAULT_LANGUAGE,
                theme: 'vs-dark',
                minimap: { enabled: true },
                automaticLayout: true,
                fontSize: 14,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                roundedSelection: false,
                wordWrap: 'on'
            });

            editor.onDidChangeModelContent(() => {
                this.detectLanguage();
            });
        });
    }

    detectLanguage() {
        const text = editor.getValue();
        let detectedLanguage = DEFAULT_LANGUAGE;

        for (const [language, pattern] of Object.entries(LANGUAGE_PATTERNS)) {
            if (pattern.test(text)) {
                detectedLanguage = language;
                break;
            }
        }

        const currentLanguage = editor.getModel().getLanguageId();
        if (currentLanguage !== detectedLanguage) {
            monaco.editor.setModelLanguage(editor.getModel(), detectedLanguage);
        }
    }

    getValue() {
        return editor.getValue();
    }

    setValue(text) {
        editor.setValue(text);
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    const editorInstance = new Editor();
    const chatInstance = new AIChat();
});