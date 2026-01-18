"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Input,
  Link,
  Stack,
  Text,
  VStack,
  HStack,
  Icon,
} from "@chakra-ui/react";
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import { Alert } from "@chakra-ui/alert";
import { Divider } from "@chakra-ui/layout";
import { FiMail, FiLock, FiUser, FiArrowRight } from "react-icons/fi";

export default function SignupPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");


  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    // Validation
    if (!username.trim()) {
      setError("Username is required");
      setLoading(false);
      return;
    }

    if (!email.trim()) {
      setError("Email is required");
      setLoading(false);
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email");
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

      const response = await fetch(`/api/users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          username: username.trim(),
          email: email.trim(),
          password: password,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.detail || data.message || "Signup failed. Please try again.");
        return;
      }

      setSuccess("Account created successfully! Redirecting to login...");

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error("Signup error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex
      minH="100vh"
      align="center"
      justify="center"
      bg="linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)"
      px={{ base: 4, md: 0 }}
    >
      <Container maxW={{ base: "sm", sm: "md" }} px={{ base: 0, md: 4 }}>
        <VStack gap={{ base: 4, md: 6 }} w="100%">
          {/* Brand Header */}
          <VStack gap={2} textAlign="center" w="100%">
            <Box
              w={{ base: 10, md: 12 }}
              h={{ base: 10, md: 12 }}
              borderRadius="full"
              bgGradient="linear(to-r, teal.500, cyan.500)"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Heading size={{ base: "sm", md: "md" }} color="white">
                FYC
              </Heading>
            </Box>
            <Heading size={{ base: "md", md: "lg" }} color="white">
              FYC Spanish Timbrado Club
            </Heading>
            <Text color="whiteAlpha.800" fontSize={{ base: "xs", md: "sm" }}>
              Spanish Timbrado breeding & management system
            </Text>
          </VStack>

          {/* Signup Card */}
          <Box
            w="100%"
            p={{ base: 6, md: 8 }}
            borderRadius="2xl"
            boxShadow="0 20px 60px rgba(0,0,0,0.3)"
            bg="white"
            transition="all 0.3s"
            _hover={{ boxShadow: "0 25px 70px rgba(0,0,0,0.35)" }}
          >
            <VStack gap={{ base: 4, md: 6 }} w="100%">
              {/* Error Alert */}
              {error && (
                <Alert
                  status="error"
                  borderRadius="lg"
                  bg="red.50"
                  borderLeft="4px solid"
                  borderColor="red.500"
                >
                  <Text color="red.700" fontSize={{ base: "xs", md: "sm" }}>
                    {error}
                  </Text>
                </Alert>
              )}

              {/* Success Alert */}
              {success && (
                <Alert
                  status="success"
                  borderRadius="lg"
                  bg="green.50"
                  borderLeft="4px solid"
                  borderColor="green.500"
                >
                  <Text color="green.700" fontSize={{ base: "xs", md: "sm" }}>
                    {success}
                  </Text>
                </Alert>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} style={{ width: "100%" }}>
                <Stack gap={{ base: 4, md: 5 }}>
                  {/* Username Field */}
                  <FormControl isRequired>
                    <FormLabel fontSize={{ base: "xs", md: "sm" }} fontWeight="600" color="gray.700">
                      Username
                    </FormLabel>
                    <HStack
                      borderRadius="lg"
                      border="2px solid"
                      borderColor="gray.200"
                      px={{ base: 2, md: 3 }}
                      py={{ base: 2, md: 2 }}
                      transition="all 0.2s"
                      _focusWithin={{
                        borderColor: "teal.600",
                        boxShadow: "0 0 0 3px rgba(66, 153, 225, 0.1)",
                      }}
                    >
                      <Icon as={FiUser} color="gray.400" boxSize={{ base: 4, md: 5 }} />
                      <Input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Choose your username"
                        border="none"
                        _focus={{ outline: "none" }}
                        fontSize={{ base: "sm", md: "sm" }}
                      />
                    </HStack>
                  </FormControl>

                  {/* Email Field */}
                  <FormControl isRequired>
                    <FormLabel fontSize={{ base: "xs", md: "sm" }} fontWeight="600" color="gray.700">
                      Email
                    </FormLabel>
                    <HStack
                      borderRadius="lg"
                      border="2px solid"
                      borderColor="gray.200"
                      px={{ base: 2, md: 3 }}
                      py={{ base: 2, md: 2 }}
                      transition="all 0.2s"
                      _focusWithin={{
                        borderColor: "teal.600",
                        boxShadow: "0 0 0 3px rgba(66, 153, 225, 0.1)",
                      }}
                    >
                      <Icon as={FiMail} color="gray.400" boxSize={{ base: 4, md: 5 }} />
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        border="none"
                        _focus={{ outline: "none" }}
                        fontSize={{ base: "sm", md: "sm" }}
                      />
                    </HStack>
                  </FormControl>

                  {/* Password Field */}
                  <FormControl isRequired>
                    <FormLabel fontSize={{ base: "xs", md: "sm" }} fontWeight="600" color="gray.700">
                      Password
                    </FormLabel>
                    <HStack
                      borderRadius="lg"
                      border="2px solid"
                      borderColor="gray.200"
                      px={{ base: 2, md: 3 }}
                      py={{ base: 2, md: 2 }}
                      transition="all 0.2s"
                      _focusWithin={{
                        borderColor: "teal.600",
                        boxShadow: "0 0 0 3px rgba(66, 153, 225, 0.1)",
                      }}
                    >
                      <Icon as={FiLock} color="gray.400" boxSize={{ base: 4, md: 5 }} />
                      <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Create a password (min 8 characters)"
                        border="none"
                        _focus={{ outline: "none" }}
                        fontSize={{ base: "sm", md: "sm" }}
                      />
                    </HStack>
                  </FormControl>

                  {/* Confirm Password Field */}
                  <FormControl isRequired>
                    <FormLabel fontSize={{ base: "xs", md: "sm" }} fontWeight="600" color="gray.700">
                      Confirm Password
                    </FormLabel>
                    <HStack
                      borderRadius="lg"
                      border="2px solid"
                      borderColor="gray.200"
                      px={{ base: 2, md: 3 }}
                      py={{ base: 2, md: 2 }}
                      transition="all 0.2s"
                      _focusWithin={{
                        borderColor: "teal.600",
                        boxShadow: "0 0 0 3px rgba(66, 153, 225, 0.1)",
                      }}
                    >
                      <Icon as={FiLock} color="gray.400" boxSize={{ base: 4, md: 5 }} />
                      <Input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm your password"
                        border="none"
                        _focus={{ outline: "none" }}
                        fontSize={{ base: "sm", md: "sm" }}
                      />
                    </HStack>
                  </FormControl>

                  {/* Signup Button */}
                  <Button
                    type="submit"
                    colorScheme="teal"
                    disabled={loading}
                    w="100%"
                    h={{ base: 10, md: 12 }}
                    fontSize={{ base: "sm", md: "sm" }}
                    fontWeight="600"
                    bgGradient="linear(to-r, blue.500, blue.600)"
                    _hover={{
                      bgGradient: "linear(to-r, blue.600, blue.700)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 10px 25px rgba(66, 153, 225, 0.3)",
                    }}
                    _active={{ transform: "translateY(0)" }}
                    transition="all 0.2s"
                  >
                    {loading ? "Creating Account..." : (
                      <HStack gap={2}>
                        <Text>Create Account</Text>
                        <FiArrowRight />
                      </HStack>
                    )}
                  </Button>
                </Stack>
              </form>

              {/* Divider */}
              <HStack w="100%" gap={3}>
                <Divider borderColor="gray.200" />
                <Text fontSize={{ base: "xs", md: "xs" }} color="gray.500" whiteSpace="nowrap">
                  Have an account?
                </Text>
                <Divider borderColor="gray.200" />
              </HStack>

              {/* Login Link */}
              <VStack gap={2} w="100%">
                <Text fontSize={{ base: "xs", md: "sm" }} color="gray.600" textAlign="center">
                  Already registered?
                </Text>
                <Link href="/login" w="100%">
                  <Button
                    w="100%"
                    variant="outline"
                    colorScheme="teal"
                    h={{ base: 9, md: 10 }}
                    fontSize={{ base: "sm", md: "sm" }}
                    fontWeight="600"
                    color="teal.600"
                    _hover={{
                      bg: "teal.50",
                      transform: "translateY(-1px)",
                    }}
                    transition="all 0.2s"
                  >
                    Sign In Instead
                  </Button>
                </Link>
              </VStack>
            </VStack>
          </Box>

          {/* Footer */}
          <Text fontSize={{ base: "xs", md: "xs" }} color="whiteAlpha.700" textAlign="center">
            © 2026 Spanish Timbrado FYC Club. All rights reserved.
          </Text>
        </VStack>
      </Container>
    </Flex>
  );
}

