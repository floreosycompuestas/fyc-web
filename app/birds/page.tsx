'use client';
import {Suspense} from 'react';
import {
    Flex,
    VStack,
    Spinner,
    Text,
} from '@chakra-ui/react';
import BirdsContent from './birds-content';
function LoadingSpinner() {
    return (
        <Flex minH="100vh" align="center" justify="center" bg="gray.50">
            <VStack gap={4}>
                <Spinner size="lg" color="teal.500"/>
                <Text color="gray.600">Loading...</Text>
            </VStack>
        </Flex>
    );
}
export default function BirdsPage() {
    return (
        <Suspense fallback={<LoadingSpinner/>}>
            <BirdsContent/>
        </Suspense>
    );
}
