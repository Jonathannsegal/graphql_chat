import { gql } from '@apollo/client';

export const POST_MESSAGE = gql`
  mutation PostMessage($text: String!, $userId: String!, $username: String!) {
    addMessage(text: $text, userId: $userId, username: $username) {
      _id
      text
      userId
      username
    }
  }
`;

export const ADD_USER = gql`
  mutation AddUser($username: String!) {
    addUser(username: $username) {
      _id
      username
    }
  }
`;

export const USER_BY_ID = gql`
  query UserById($userId: String!) {
    userId(userId: $userId) {
      _id
      username
    }
  }
`;

export const GET_MESSAGES = gql`
  query GetMessages {
    messages {
      _id
      text
      userId
      username
    }
  }
`;

export const MESSAGES_SUBSCRIPTION = gql`
  subscription {
    messages {
      _id
      text
    }
  }
`;
