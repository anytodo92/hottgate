// Generic imports

// React imports
import { useState, useEffect, useContext } from "react";

// React related imports
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

// Context imports
import { LoginContext } from "../contexts"

//Component imports

// --------------------------------------------------------------------------------

export function TestPage() {
  console.log("TestPage")
  // object with keys {nickname, name, picture, updated_at, email, email_verified, sub}
  // const [mock, setMock] = useState({ message: null });
  const [test1, setTest1] = useState(null);
  const [test2, setTest2] = useState(null);
  const [test3, setTest3] = useState(null);

  const { user, canFetch, jwtFetch } = useContext(LoginContext)

  // useEffect(() => {
  //   let mounted = true;
  //   if (canFetch) {
  //     jwtFetch("https://0n3.metagate.art/one/mock", null, (res) => {
  //       if (mounted) {
  //         setMock(res);
  //       }
  //     });
  //   }
  //   return () => {
  //     mounted = false;
  //   }
  // }, [canFetch, jwtFetch]);

  useEffect(() => {
    let mounted = true;
    if (canFetch) {
      jwtFetch({
        cmd: 'test.any'
      },
        (res) => {
          if (mounted) {
            setTest1(JSON.stringify(res, null, 3))
          }
        });
    }
    return () => {
      mounted = false;
    }
  }, [canFetch, jwtFetch]);

  useEffect(() => {
    let mounted = true;
    if (canFetch) {
      jwtFetch({
        cmd: 'test.nonsense'
      },
        (res) => {
          if (mounted) {
            setTest2(JSON.stringify(res, null, 3))
          }
        });
    }
    return () => {
      mounted = false;
    }
  }, [canFetch, jwtFetch]);

  useEffect(() => {
    let mounted = true;
    if (canFetch) {
      jwtFetch({
        cmd: 'test.page'
      },
        (res) => {
          if (mounted) {
            setTest3(JSON.stringify(res, null, 3))
          }
        });
    }
    return () => {
      mounted = false;
    }
  }, [canFetch, jwtFetch]);

  return (
    <>
      <Container>
        <Typography variant="h1">Test Page</Typography>
        <Typography component="pre">User: {user ? JSON.stringify(user, null, 3) : "NOTHING"}</Typography>
        {/* <Typography>Mock: {mock && mock.message ? mock.message : "NOTHING"}</Typography> */}
        <Typography component="pre">test.any: {test1 ? test1 : "NOTHING"}</Typography>
        <Typography component="pre">test.nonsense: {test2 ? test2 : "NOTHING"}</Typography>
        <Typography component="pre">test.page: {test3 ? test3 : "NOTHING"}</Typography>
      </Container>
    </>
  );


}