import { pages } from '@/pages';
import { useRouter } from 'next/navigation';

const useRdHome = () => {
  const router = useRouter()


  return () => router.push(pages.D.path)
}

export {
  useRdHome
};
