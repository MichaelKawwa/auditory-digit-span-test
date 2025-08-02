import React, { useState, useEffect } from 'react';
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
} from '@chakra-ui/react';

export type DigitSpanResults = {
  forward: number;
  backward: number;
  sequencing: number;
};

type Subtest = 'forward' | 'backward' | 'sequencing';

type DigitSpanTestProps = {
  age: number;
  onComplete: (results: DigitSpanResults) => void;
};

const subtestOrder: Subtest[] = ['forward', 'backward', 'sequencing'];
const subtestNames: Record<Subtest, string> = {
  forward: 'Digit Span Forward',
  backward: 'Digit Span Backward',
  sequencing: 'Digit Span Sequencing',
};

// Helper to generate a random digit sequence
function generateDigits(length: number): number[] {
  const digits: number[] = [];
  while (digits.length < length) {
    const d = Math.floor(Math.random() * 9) + 1; // 1-9
    digits.push(d);
  }
  return digits;
}

// Helper to speak digits aloud with progress and bug fix
function speakDigits(
  digits: number[],
  onProgress: (current: number) => void
): Promise<void> {
  return new Promise((resolve) => {
    let i = 0;
    window.speechSynthesis.cancel(); // Fix: clear any queued utterances
    const speakNext = () => {
      if (i < digits.length) {
        onProgress(i);
        const utter = new window.SpeechSynthesisUtterance(digits[i].toString());
        utter.onend = () => {
          i++;
          setTimeout(speakNext, 1000); // 1s between digits
        };
        window.speechSynthesis.speak(utter);
      } else {
        onProgress(-1);
        resolve();
      }
    };
    setTimeout(speakNext, 400); // Small delay before starting
  });
}

// Helper to recognize speech (returns a Promise)
function recognizeSpeech(): Promise<string> {
  return new Promise((resolve, reject) => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      reject('Speech recognition not supported');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      resolve(transcript);
    };
    recognition.onerror = (event: any) => {
      reject(event.error);
    };
    recognition.start();
  });
}

// Parse spoken digits from transcript
function parseDigits(transcript: string): number[] {
  // Map number words to digits
  const wordToDigit: Record<string, string> = {
    'zero': '0',
    'one': '1',
    'two': '2',
    'three': '3',
    'four': '4',
    'five': '5',
    'six': '6',
    'seven': '7',
    'eight': '8',
    'nine': '9',
  };
  let normalized = transcript.toLowerCase();
  for (const [word, digit] of Object.entries(wordToDigit)) {
    const regex = new RegExp(`\\b${word}\\b`, 'g');
    normalized = normalized.replace(regex, digit);
  }
  return normalized
    .replace(/[^0-9 ]/g, '')
    .split(' ')
    .flatMap(s =>
      s.length > 1
        ? s.split('').map(d => parseInt(d, 10))
        : [parseInt(s, 10)]
    )
    .filter(n => !isNaN(n));
}

const maxFailures = 2;
const initialLength = 2;
const maxLengths: Record<Subtest, number> = {
  forward: 9,
  backward: 8,
  sequencing: 8,
};
const trialsPerLength = 2;

const DigitSpanTest: React.FC<DigitSpanTestProps> = ({ age, onComplete }) => {
  const [subtestIdx, setSubtestIdx] = useState(0);
  const [length, setLength] = useState(initialLength);
  const [trial, setTrial] = useState(0);
  const [failures, setFailures] = useState(0);
  const [score, setScore] = useState({ forward: 0, backward: 0, sequencing: 0 });
  const [digits, setDigits] = useState<number[] | null>(null);
  const [status, setStatus] = useState<'idle' | 'speaking' | 'listening' | 'waiting' | 'done'>('idle');
  const [message, setMessage] = useState('');
  const [speakingIdx, setSpeakingIdx] = useState(-1); // For progress bar

  const subtest = subtestOrder[subtestIdx];

  // Automatically start the first trial and subsequent trials
  useEffect(() => {
    if (status === 'idle' && subtestIdx < subtestOrder.length) {
      const timer = setTimeout(() => {
        // Announce subtest transition if this is the first trial of a new subtest
        if (trial === 0 && length === initialLength) {
          announceSubtest();
        } else {
          startTrial();
        }
      }, 600); // short delay for pacing
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line
  }, [status, subtestIdx, length, trial]);

  // Announce the current subtest
  const announceSubtest = () => {
    const subtestName = subtestNames[subtest];
    setMessage(`Now beginning ${subtestName}. Get ready...`);
    
    const utterance = new window.SpeechSynthesisUtterance(
      `Now beginning ${subtestName}. Get ready.`
    );
    utterance.onend = () => {
      setTimeout(() => {
        startTrial();
      }, 1000); // 1 second pause after announcement
    };
    window.speechSynthesis.speak(utterance);
  };

  // Start a new trial
  const startTrial = () => {
    const newDigits = generateDigits(length);
    setDigits(newDigits);
    setStatus('speaking');
    setMessage('Listen carefully...');
    setSpeakingIdx(-1);
    console.log('Generated digits:', newDigits);
    speakDigits(newDigits, setSpeakingIdx).then(() => {
      setStatus('listening');
      setSpeakingIdx(-1);
      setMessage('Please repeat the digits aloud.');
      recognizeSpeech()
        .then(transcript => {
          console.log('Recognized transcript:', transcript);
          const response = parseDigits(transcript);
          console.log('Parsed digits:', response);
          let correct = false;
          if (subtest === 'forward') {
            correct = JSON.stringify(response) === JSON.stringify(newDigits);
          } else if (subtest === 'backward') {
            correct = JSON.stringify(response) === JSON.stringify([...newDigits].reverse());
          } else if (subtest === 'sequencing') {
            correct = JSON.stringify(response) === JSON.stringify([...newDigits].sort((a, b) => a - b));
          }
          if (correct) {
            setScore(s => ({ ...s, [subtest]: s[subtest] + 1 }));
            setFailures(0);
            setMessage('Correct!');
          } else {
            setFailures(f => f + 1);
            setMessage('Incorrect.');
          }
          setStatus('waiting');
          setTimeout(() => {
            nextTrial(correct);
          }, 1200);
        })
        .catch(() => {
          setMessage('Could not recognize speech. Try to speak clearly.');
          setStatus('waiting');
          setTimeout(() => {
            nextTrial(false);
          }, 1200);
        });
    });
  };

  // Move to next trial or subtest
  const nextTrial = (lastCorrect: boolean) => {
    if (!lastCorrect) {
      if (failures + 1 >= maxFailures) {
        // End subtest
        if (subtestIdx + 1 < subtestOrder.length) {
          setSubtestIdx(subtestIdx + 1);
          setLength(initialLength);
          setTrial(0);
          setFailures(0);
          setStatus('idle');
          setMessage('');
        } else {
          setStatus('done');
          onComplete(score);
        }
        return;
      }
    }
    if (trial + 1 < trialsPerLength) {
      setTrial(trial + 1);
    } else {
      setTrial(0);
      // Only increase length if not at max for this subtest
      const currentMax = maxLengths[subtest];
      if (length + 1 <= currentMax) {
        setLength(length + 1);
      } else {
        // End subtest if max length reached
        if (subtestIdx + 1 < subtestOrder.length) {
          setSubtestIdx(subtestIdx + 1);
          setLength(initialLength);
          setTrial(0);
          setFailures(0);
          setStatus('idle');
          setMessage('');
        } else {
          setStatus('done');
          onComplete(score);
        }
        return;
      }
    }
    setStatus('idle');
    setMessage('');
  };

  // Remove the Start button UI
  if (status === 'idle' && subtestIdx < subtestOrder.length) {
    return (
      <VStack spacing={6} align="stretch" maxW="800px" mx="auto" p={6}>
      <Text fontSize="2xl" fontWeight="bold" textAlign="center">
        Digit Span {subtestNames[subtest]}
      </Text>
      <Text fontSize="m" fontWeight="bold" textAlign="center" color="teal.500">
        Sequence length: {length}
      </Text>
      <Text 
        fontSize="m" 
        fontWeight="bold" 
        textAlign="center" 
        color={message === 'Incorrect.' ? 'red.500' : 'teal.500'}
      >
        {message}
      </Text>
      
      {/* Live Score Table */}
      <Box mt={8} p={4} bg="gray.50" borderRadius="lg">
        <Text fontSize="lg" fontWeight="bold" mb={3} textAlign="center" color="teal.600">
          Current Scores
        </Text>
        <TableContainer>
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>Subtest</Th>
                <Th isNumeric>Score</Th>
                <Th>Status</Th>
              </Tr>
            </Thead>
            <Tbody>
              <Tr bg={subtest === 'forward' ? 'teal.50' : 'white'}>
                <Td fontWeight="medium">Digit Span Forward</Td>
                <Td isNumeric fontWeight="bold">{score.forward}</Td>
                <Td>
                  {subtestIdx > 0 ? '✓ Completed' : 
                   subtest === 'forward' ? '🔄 In Progress' : '⏳ Pending'}
                </Td>
              </Tr>
              <Tr bg={subtest === 'backward' ? 'teal.50' : 'white'}>
                <Td fontWeight="medium">Digit Span Backward</Td>
                <Td isNumeric fontWeight="bold">{score.backward}</Td>
                <Td>
                  {subtestIdx > 1 ? '✓ Completed' : 
                   subtest === 'backward' ? '🔄 In Progress' : '⏳ Pending'}
                </Td>
              </Tr>
              <Tr bg={subtest === 'sequencing' ? 'teal.50' : 'white'}>
                <Td fontWeight="medium">Digit Span Sequencing</Td>
                <Td isNumeric fontWeight="bold">{score.sequencing}</Td>
                <Td>
                  {subtestIdx > 2 ? '✓ Completed' : 
                   subtest === 'sequencing' ? '🔄 In Progress' : '⏳ Pending'}
                </Td>
              </Tr>
            </Tbody>
          </Table>
        </TableContainer>
      </Box>
      </VStack>
    );
  }

  if (status === 'done') {
    return <div className="digit-span-test"><h2> <Text fontSize="2xl" fontWeight="bold" textAlign="center">
        {subtestNames[subtest]}
      </Text></h2></div>;
  }

  return (
    <VStack spacing={6} align="stretch" maxW="800px" mx="auto" p={6}>
      <Text fontSize="2xl" fontWeight="bold" textAlign="center">
       {subtestNames[subtest]}
      </Text>
      <Text fontSize="m" fontWeight="bold" textAlign="center" color="teal.500">
        Sequence length: {length}
      </Text>
      <Text 
        fontSize="m" 
        fontWeight="bold" 
        textAlign="center" 
        color={message === 'Incorrect.' ? 'red.500' : 'teal.500'}
      >
        {message}
      </Text>
      {status === 'speaking' && digits && (
        <div style={{ margin: '12px 0' }}>
          <div>Now speaking...</div>
          <div style={{
            background: '#e5e7eb',
            borderRadius: 6,
            height: 16,
            width: '100%',
            overflow: 'hidden',
            marginTop: 6
          }}>
            <div style={{
              background: 'teal',
              height: '100%',
              width: digits.length > 0 && speakingIdx >= 0 ? `${((speakingIdx + 1) / digits.length) * 100}%` : '0%',
              transition: 'width 0.3s'
            }} />
          </div>
        </div>
      )}
      {status === 'listening' && <p>Listening for your response...</p>}
      
      {/* Live Score Table */}
      <Box mt={8} p={4} bg="gray.50" borderRadius="lg">
        <Text fontSize="lg" fontWeight="bold" mb={3} textAlign="center" color="teal.600">
          Current Scores
        </Text>
        <TableContainer>
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>Subtest</Th>
                <Th isNumeric>Score</Th>
                <Th>Status</Th>
              </Tr>
            </Thead>
            <Tbody>
              <Tr bg={subtest === 'forward' ? 'teal.50' : 'white'}>
                <Td fontWeight="medium">Digit Span Forward</Td>
                <Td isNumeric fontWeight="bold">{score.forward}</Td>
                <Td>
                  {subtestIdx > 0 ? '✓ Completed' : 
                   subtest === 'forward' ? '🔄 In Progress' : '⏳ Pending'}
                </Td>
              </Tr>
              <Tr bg={subtest === 'backward' ? 'teal.50' : 'white'}>
                <Td fontWeight="medium">Digit Span Backward</Td>
                <Td isNumeric fontWeight="bold">{score.backward}</Td>
                <Td>
                  {subtestIdx > 1 ? '✓ Completed' : 
                   subtest === 'backward' ? '🔄 In Progress' : '⏳ Pending'}
                </Td>
              </Tr>
              <Tr bg={subtest === 'sequencing' ? 'teal.50' : 'white'}>
                <Td fontWeight="medium">Digit Span Sequencing</Td>
                <Td isNumeric fontWeight="bold">{score.sequencing}</Td>
                <Td>
                  {subtestIdx > 2 ? '✓ Completed' : 
                   subtest === 'sequencing' ? '🔄 In Progress' : '⏳ Pending'}
                </Td>
              </Tr>
            </Tbody>
          </Table>
        </TableContainer>
      </Box>
    </VStack>
  );
};

export default DigitSpanTest;
