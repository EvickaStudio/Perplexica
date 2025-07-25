import ChatWindow from '@/components/ChatWindow';
import { Metadata } from 'next';
import { Suspense } from 'react';
import ProtectedPage from '@/components/ProtectedPage';

export const metadata: Metadata = {
  title: 'Chat - Perplexica',
  description: 'Chat with the internet, chat with Perplexica.',
};

const Home = () => {
  return (
    <ProtectedPage>
      <div>
        <Suspense>
          <ChatWindow />
        </Suspense>
      </div>
    </ProtectedPage>
  );
};

export default Home;
