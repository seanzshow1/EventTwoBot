const { PineconeClient } = require("@pinecone-database/pinecone");
const { OpenAIEmbeddings } = require("langchain/embeddings/openai");
const { OpenAI } = require("langchain/llms/openai");
const { loadQAStuffChain } = require("langchain/chains");
const { Document } = require("langchain/document");
const dotenv = require("dotenv");

dotenv.config();

const client = new PineconeClient();

async function initializeClient() {
    await client.init({
        apiKey: process.env.PINECONE_API_KEY,
        environment: process.env.PINECONE_ENVIRONMENT,
    });
}

async function queryPineconeAndGPT(question) {
    const indexName = "your-pinecone-index-name"; // You should define this
    await initializeClient();
    const index = client.Index(indexName);
    const queryEmbedding = await new OpenAIEmbeddings().embedQuery(question);

    const queryResponse = await index.query({
        queryRequest: {
            topK: 10,
            vector: queryEmbedding,
            includeMetadata: true,
            includeValues: true,
        },
    });

    if (queryResponse.matches.length) {
        const llm = new OpenAI({});
        const chain = loadQAStuffChain(llm);
        const concatenatedPageContent = queryResponse.matches
            .map((match) => match.metadata.pageContent)
            .join(" ");

        const result = await chain.call({
            input_documents: [new Document({ pageContent: concatenatedPageContent })],
            question: question,
        });

        return result.text;
    } else {
        return "Sorry, we couldn't find an answer to your question.";
    }
}

module.exports = queryPineconeAndGPT;
