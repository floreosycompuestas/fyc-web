'use client';

import { Box, Container, Flex, HStack, Text, Link as ChakraLink } from '@chakra-ui/react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      bg="gray.800"
      color="gray.200"
      py={{ base: 6, md: 8 }}
      borderTop="1px"
      borderColor="gray.700"
    >
      <Container maxW="7xl" px={{ base: 4, md: 6 }}>
        <Flex
          justifyContent={{ base: 'center', md: 'space-between' }}
          alignItems="center"
          flexDirection={{ base: 'column', md: 'row' }}
          gap={{ base: 4, md: 0 }}
        >
          <Text
            fontSize={{ base: 'xs', md: 'sm' }}
            textAlign={{ base: 'center', md: 'left' }}
          >
            &copy; {currentYear} Spanish Timbrado Young Club. All rights reserved.
          </Text>
          <HStack
            gap={{ base: 3, md: 6 }}
            fontSize={{ base: 'xs', md: 'sm' }}
            flexWrap="wrap"
            justifyContent={{ base: 'center', md: 'flex-end' }}
          >
            <ChakraLink
              href="#"
              cursor="pointer"
              _hover={{ color: 'white', textDecoration: 'underline' }}
              transition="color 0.2s"
            >
              Privacy Policy
            </ChakraLink>
            <ChakraLink
              href="#"
              cursor="pointer"
              _hover={{ color: 'white', textDecoration: 'underline' }}
              transition="color 0.2s"
            >
              Terms of Service
            </ChakraLink>
            <ChakraLink
              href="#"
              cursor="pointer"
              _hover={{ color: 'white', textDecoration: 'underline' }}
              transition="color 0.2s"
            >
              Contact
            </ChakraLink>
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
}
