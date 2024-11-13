import { useState, useEffect } from "react";
import Link from "src/components/Link";
import PageWrapper from "src/components/PageWrapper";
import { useFetchUserData } from "src/hooks";



const Home = () => {
  const [Username, setUsername] = useState("");
  useEffect(() => {
    const username = localStorage.getItem("username") || "";
    console.log("Username:", username);
    setUsername(username);
  }, []);
  const { userData, loading } = useFetchUserData(Username);
  if (loading) return <p>Loading...</p>;




  return(
  <PageWrapper title="Home">
    {localStorage.getItem("authToken") ? (
      <div className="flex flex-column items-center justify-center">
        <h1>Welcome back {userData?.firstName} {userData?.lastName}</h1>
        <div>
          <p>Here are your challanges for the week</p>
          <ul>
            <li>Monday: Run 5 miles</li>
            <li>Tuesday: Do 100 pushups</li>
            <li>Wednesday: Do 100 situps</li>
            <li>Thursday: Run 5 miles</li>
            <li>Friday: Do 100 pushups</li>
            <li>Saturday: Do 100 situps</li>
            <li>Sunday: Rest</li>
          </ul>
        </div>
        <div>
          <p>Want to create new challenges? 
          <Link
          to="/rank"
          >
            click here!
          </Link>
          </p>
        </div>
      </div>
    ) : (
      <div className="flex flex-column items-center justify-center">
        <h1>Welcome to Fitness Trading!</h1>
        <p>
          Fitness Trading is a platform for trading fitness plans, workouts, and meal plans.
        </p>
        <p>
          Please <a href="/login">login</a> or <a href="/register">register</a> to get started.
        </p>
      </div>
    )}
  </PageWrapper>
)};

export default Home;
