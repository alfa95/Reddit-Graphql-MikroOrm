import {
  Box,
  Button,
  Flex,
  Heading,
  Link,
  Stack,
  Text,
} from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import React, { useState } from "react";
import { Layout } from "../components/layout";
import { usePostsQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";
import NextLink from "next/link";

const Index = () => {
  const [variables, setVariables] = useState({ limit: 10, cursor: null as null | string, });
  const [{ data, fetching }] = usePostsQuery({
    variables,
  });

  
  return (
    <Layout>
      <Flex align="center">
        <Heading>Reddit</Heading>
        <NextLink href="/create-post">
          <Link ml="auto">Create Post</Link>
        </NextLink>
      </Flex>
      <Stack spacing={8}>
        {!data && fetching ? (
          <div>loading...</div>
        ) : (
          data.posts.posts.map((p) => (
            <Box key={p.id} p={5} shadow="md" borderWidth="1px">
              <Heading fontSize="xl">{p.title}</Heading>
              <Text mt={4}>{p.textSnippet}</Text>
            </Box>
          ))
        )}
      </Stack>
      {data && data.posts.hasMore ? (
        <Flex>
        <Button
          onClick={() => {
            setVariables({
              limit: variables.limit,
              cursor: data.posts.posts[data.posts.posts.length - 1].createdAt,
            });
          }}
          isLoading={fetching}
          m="auto"
          my={4}
        >
          Load More +
        </Button>
        <div>{data.posts.posts.length}</div>
      </Flex>
      ): (<div></div>)}
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
