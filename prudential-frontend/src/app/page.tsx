import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function Home() {
  const cookieStore = await cookies();
  const access = cookieStore.get('access')?.value;
  if (!access) {
    redirect('/login');
  }
  redirect('/dashboard');
}
