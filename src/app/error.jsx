"use client" // car la page error utilise méthdoe comme reset() qui sont à utilsier avec des écouteurs d'évenements
import Link from 'next/link'
 
export default function Error() {
  return (
    <div className='pt-44 text-center'>
      <h1 className='text-4xl mb-4'>A server error has occured</h1>
      <Link href="/" className='underline'>Return Home</Link>
    </div>
  )
}