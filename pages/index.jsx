import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import Search from "../components/search";
import { useFirebase } from "../context/firebaseContext"

export default function Home() {
  const { useAuth } = useFirebase();
  const { user } = useAuth();
  // console.log(user);  
  return (
    <>
      <Search />
      <div className={styles.container}>
        <Head>
          <title>Homestay App</title>
          <meta name="description" content="Generated by create next app" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <main className={styles.main}></main>
      </div>
    </>
  );
}

export async function getStaticProps(context) {
  return {
    props: {},
  };
}
