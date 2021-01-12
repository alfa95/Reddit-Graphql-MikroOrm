import React from "react";
import { Form, Formik } from "formik";
import { InputField } from "../components/InputField";
import { Wrapper } from "../components/Wrapper";
import { Box, Button, Flex, Link } from "@chakra-ui/react";
import { useLoginMutation } from "../generated/graphql";
import { toErrorMap } from "../utils/toErrorMap";
import { useRouter } from "next/router";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";
import NextLink from "next/link";

const Login: React.FC<{}> = ({}) => {
  const router = useRouter();
  const [, login] = useLoginMutation();
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ username: "", password: "" }}
        onSubmit={async (values, { setErrors }) => {
          const response = await login({
            username: values.username,
            password: values.password,
          });
          if (response.data?.login.error) {
            setErrors(toErrorMap(response.data.login.error));
          } else if (response.data?.login.user) {
            if(typeof router.query.next === 'string') {
              router.push(router.query.next);
            } else {
              router.push("/");
            }
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <Box mt={4}>
              <InputField
                name="username"
                placeholder="username"
                label="Username"
              />
            </Box>
            <Box mt={4}>
              <InputField
                name="password"
                placeholder="password"
                label="Password"
                type="password"
              />
            </Box>
            <Flex mt={2}>
            <NextLink href="/forgot-password">
                  <Link ml="auto">Forgot Password</Link>
                </NextLink>
                </Flex>
              <Button
                mt={2}
                type="submit"
                isLoading={isSubmitting}
                colorScheme="teal"
              >
                Login
              </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default withUrqlClient(createUrqlClient)(Login);
