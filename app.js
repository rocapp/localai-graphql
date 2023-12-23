const fetch = require('cross-fetch');
const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const fs = require('fs');
const path = require('path');

// Read the schema from a local file
const schemaPath = path.join(__dirname, 'schema.graphql');
const schema = fs.readFileSync(schemaPath, 'utf-8');

const app = express();

// resolvers
// Function to fetch data from the API
const fetchDataFromAPI = async (url) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API request failed with status: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// Resolver function for 'listAllModels'
const listAllModels = async () => {
  const apiUrl = 'http://localhost:8080/models/available';
  const data = await fetchDataFromAPI(apiUrl);
  return data;
};

// Resolver function for 'searchModelsByName'
const searchModelsByName = async ({ nameContains }) => {
  if (!nameContains) {
    return [];
  }

  const apiUrl = 'http://localhost:8080/models/available';
  const data = await fetchDataFromAPI(apiUrl);

  // Filter models whose names contain the provided substring
  return data.filter((model) => model.name.includes(nameContains));
};

app.use('/graphql', graphqlHTTP({
  schema: buildSchema(schema),
  rootValue: {
    listAllModels,
    searchModelsByName
  }, // Your resolver functions go here
  graphiql: true, // Enable the GraphiQL interface for testing
}));

const port = 3000;
app.listen(port, () => {
  console.log(`GraphQL server is running on http://localhost:${port}/graphql`);
});
