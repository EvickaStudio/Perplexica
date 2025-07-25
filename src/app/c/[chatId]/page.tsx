import ChatWindow from '@/components/ChatWindow';
import React from 'react';
import ProtectedPage from '@/components/ProtectedPage';

const Page = ({ params }: { params: Promise<{ chatId: string }> }) => {
  const { chatId } = React.use(params);
  return (
    <ProtectedPage>
      <ChatWindow id={chatId} />
    </ProtectedPage>
  );
};

export default Page;
