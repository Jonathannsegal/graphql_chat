import React from 'react';
import PropTypes from 'prop-types';
import { View, Text, FlatList } from 'react-native';
import { useQuery } from '@apollo/client';
import { GET_MESSAGES, MESSAGES_SUBSCRIPTION } from '../constants/graphql';

class MessageList extends React.Component {
  componentDidMount() {
    this.props.subscribeToMore();
  }

  render() {
    return (
      <FlatList
        ref = "flatList"
        onContentSizeChange={()=> this.refs.flatList.scrollToEnd()}
        data={this.props.value.messages}
        renderItem={({ item }) => <Item text={item.text} username={item.username} />}
        keyExtractor={(item) => item._id}
      />
    );
  }
}

MessageList.propTypes = {
  subscribeToMore: PropTypes.func.isRequired,
  value: PropTypes.object.isRequired
};

function Item({ text, username }) {
  return (
    <View style={{ paddingLeft: 20, paddingVertical: 5 }}>
      <Text style={{ color: '#808080', fontSize: 10 }}>{username}</Text>
      <Text style={{ color: '#000000', fontSize: 15 }}>{text}</Text>
    </View>
  );
}

Item.propTypes = {
  text: PropTypes.string.isRequired
};

export const Messages = () => {
  const { loading, error, data, subscribeToMore } = useQuery(GET_MESSAGES);

  if (loading) return <Text>Loading...</Text>;
  if (error) return <Text>Error :(</Text>;

  const more = () =>
    subscribeToMore({
      document: MESSAGES_SUBSCRIPTION,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        const newMessage = subscriptionData.data.messages;
        return { ...prev, messages: [...prev.messages, newMessage] };
      }
    });
  return <MessageList value={data} subscribeToMore={more} />;
};
