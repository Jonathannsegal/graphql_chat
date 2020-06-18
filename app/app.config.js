export default ({config}) => {
  return Object.assign(config,
    {
      extra: {
        WSHOST: 'https://graphqlchatgcp.uc.r.appspot.com/graphql',
        HTTPHOST: 'https://graphqlchatgcp.uc.r.appspot.com/'
      }
    });
};