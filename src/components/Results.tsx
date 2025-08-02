import React from 'react';
import {
  VStack,
  Text,
  Button,
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Badge,
  HStack,
} from '@chakra-ui/react';
import { rawToScaledScore } from './Norms';
import { DigitSpanResults } from './DigitSpanTest';

type ResultsProps = {
  results: DigitSpanResults;
  age: number;
  onRestart: () => void;
};

const Results: React.FC<ResultsProps> = ({ results, age, onRestart }) => {
  const { forward, backward, sequencing } = results;
  const totalRaw = forward + backward + sequencing;
  const scaled = rawToScaledScore(totalRaw, age);

  return (
    <VStack spacing={6} align="stretch" maxW="800px" mx="auto" p={6}>
      <Text fontSize="2xl" fontWeight="bold" textAlign="center" color="teal.600">
        Your Results
      </Text>
      
      <Box bg="teal.50" p={6} borderRadius="lg" border="1px" borderColor="teal.200">
        <Text fontSize="lg" fontWeight="bold" mb={4} textAlign="center" color="teal.700">
          Raw Scores
        </Text>
        <TableContainer>
          <Table variant="simple" size="md">
            <Thead>
              <Tr>
                <Th color="teal.700">Subtest</Th>
                <Th isNumeric color="teal.700">Raw Score</Th>
              </Tr>
            </Thead>
            <Tbody>
              <Tr>
                <Td fontWeight="medium">Digit Span Forward</Td>
                <Td isNumeric fontWeight="bold">{forward}</Td>
              </Tr>
              <Tr>
                <Td fontWeight="medium">Digit Span Backward</Td>
                <Td isNumeric fontWeight="bold">{backward}</Td>
              </Tr>
              <Tr>
                <Td fontWeight="medium">Digit Span Sequencing</Td>
                <Td isNumeric fontWeight="bold">{sequencing}</Td>
              </Tr>
              <Tr bg="teal.100">
                <Td fontWeight="bold" color="teal.800">Total Raw Score</Td>
                <Td isNumeric fontWeight="bold" color="teal.800">{totalRaw}</Td>
              </Tr>
            </Tbody>
          </Table>
        </TableContainer>
      </Box>

      <Box bg="gray.50" p={6} borderRadius="lg" border="1px" borderColor="gray.200">
        <Text fontSize="lg" fontWeight="bold" mb={4} textAlign="center" color="gray.700">
          Standardized Scores
        </Text>
        <VStack spacing={4} align="stretch">
          <HStack justify="space-between" p={3} bg="white" borderRadius="md">
            <Text fontWeight="medium">Scaled Score: </Text>
            <Badge colorScheme="teal" fontSize="md" px={3} py={1}>
              {scaled}
            </Badge>
          </HStack>
          <HStack justify="space-between" p={3} bg="white" borderRadius="md">
            <Text fontWeight="medium">Working Memory Index (IQ):</Text>
            <Badge colorScheme="blue" fontSize="md" px={3} py={1}>
              {scaled * 10}
            </Badge>
          </HStack>
        </VStack>
      </Box>

      <Button 
        colorScheme="teal" 
        size="lg" 
        onClick={onRestart}
        alignSelf="center"
      >
        Take Test Again
      </Button>
    </VStack>
  );
};

export default Results;
