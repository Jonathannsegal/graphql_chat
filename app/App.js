import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ApolloClient, ApolloProvider, split, HttpLink, InMemoryCache } from '@apollo/client';
import { getMainDefinition } from '@apollo/client/utilities';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { ChatScreen } from './src/ChatScreen';
import { LoginScreen } from './src/LoginScreen';
import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra || {};
const wsLink = new GraphQLWsLink(createClient({
  url: extra.WSHOST || 'ws://localhost:4000/graphql'
}));

const httpLink = new HttpLink({
  uri: extra.HTTPHOST || 'http://localhost:4000/graphql'
});

const link = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
  },
  wsLink,
  httpLink
);

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link
});

const Stack = createNativeStackNavigator();

const App = () => (
  <ApolloProvider client={client}>
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} />
      </Stack.Navigator>
    </NavigationContainer>
   </ApolloProvider>
);

export default App;
