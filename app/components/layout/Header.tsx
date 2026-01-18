'use client';

import { Box, Container, Flex, Heading, HStack, IconButton, VStack, Button, Link as ChakraLink, Icon } from '@chakra-ui/react';
import { FiMenu, FiX, FiLogOut } from 'react-icons/fi';
import { GiEagleHead } from 'react-icons/gi';
import { useRouter } from 'next/navigation';
import { useDisclosure } from '@chakra-ui/react';
import { NAV_ITEMS } from '@/app/lib/constants';

interface HeaderProps {
  onLogout: () => void;
  showLogout?: boolean; // Optional prop to hide logout button on public pages
}

export default function Header({ onLogout, showLogout = true }: HeaderProps) {
  const router = useRouter();
  const { open, onOpen, onClose } = useDisclosure();

  const navItems = NAV_ITEMS;

  return (
    <Box
      bg="teal.600"
      boxShadow="md"
      position="sticky"
      top={0}
      zIndex={10}
      borderBottom="1px"
      borderColor="teal.700"
    >
      <Container maxW="7xl" px={{ base: 4, md: 6 }}>
        <Flex h={{ base: 14, md: 16 }} align="center" justify="space-between">
          {/* Logo with Eagle Icon */}
          <HStack
            gap={{ base: 1, md: 2 }}
            cursor="pointer"
            onClick={() => router.push('/dashboard')}
            _hover={{ opacity: 0.9 }}
            transition="opacity 0.3s"
          >
            <Icon
              as={GiEagleHead}
              w={{ base: 6, md: 8 }}
              h={{ base: 6, md: 8 }}
              color="white"
            />
            <Heading
              size={{ base: "md", md: "lg" }}
              color="white"
            >
              FYC
            </Heading>
          </HStack>

          {/* Desktop Navigation */}
          <HStack
            display={{ base: 'none', md: 'flex' }}
            gap={1}
            as="nav"
          >
            {navItems.map((item) => (
              <ChakraLink
                key={item.label}
                href={item.href}
                px={3}
                py={2}
                rounded="md"
                _hover={{ bg: 'teal.500', color: 'white' }}
                fontSize="sm"
                fontWeight="500"
                color="teal.50"
                transition="all 0.2s"
              >
                {item.label}
              </ChakraLink>
            ))}
          </HStack>

          {/* Desktop Logout */}
          {showLogout && (
            <HStack gap={4} display={{ base: 'none', md: 'flex' }}>
              <Button
                colorScheme="red"
                size="sm"
                variant="solid"
                onClick={onLogout}
              >
                <FiLogOut style={{ marginRight: '8px' }} />
                Logout
              </Button>
            </HStack>
          )}

          {/* Mobile Menu Button */}
          <IconButton
            onClick={open ? onClose : onOpen}
            variant="ghost"
            display={{ base: 'flex', md: 'none' }}
            aria-label="Toggle menu"
            size="sm"
            color="white"
            _hover={{ bg: 'teal.500' }}
          >
            {open ? <FiX size={24} /> : <FiMenu size={24} />}
          </IconButton>
        </Flex>

        {/* Mobile Navigation Menu */}
        {open && (
          <VStack
            display={{ base: 'flex', md: 'none' }}
            gap={0}
            pb={4}
            borderTop="1px"
            borderColor="teal.700"
            align="stretch"
          >
            {navItems.map((item) => (
              <ChakraLink
                key={item.label}
                href={item.href}
                px={3}
                py={2}
                _hover={{ bg: 'teal.500', color: 'white' }}
                fontSize="sm"
                fontWeight="500"
                color="teal.50"
                onClick={onClose}
                transition="all 0.2s"
              >
                {item.label}
              </ChakraLink>
            ))}
            {showLogout && (
              <Box px={3} py={2} borderTop="1px" borderColor="teal.700">
                <Button
                  w="100%"
                  colorScheme="red"
                  size="sm"
                  variant="solid"
                  onClick={onLogout}
                >
                  <FiLogOut style={{ marginRight: '8px' }} />
                  Logout
                </Button>
              </Box>
            )}
          </VStack>
        )}
      </Container>
    </Box>
  );
}

