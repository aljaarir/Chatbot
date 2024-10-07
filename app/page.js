'use client'

import { Box, Button, Stack, TextField, Typography } from '@mui/material'
import { useRef, useEffect, useState } from 'react'

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I am Ryan Aljaari, a Michigan State University student studying Computer Science. How can I help you today?",
    },
  ])
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return
    setIsLoading(true)

    setMessages((messages) => [
      ...messages,
      { role: 'user', content: message },
      { role: 'assistant', content: '' },
    ])
    setMessage('')

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([...messages, { role: 'user', content: message }]),
      })

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const text = decoder.decode(value, { stream: true })
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1]
          let otherMessages = messages.slice(0, messages.length - 1)
          return [
            ...otherMessages,
            { ...lastMessage, content: lastMessage.content + text },
          ]
        })
      }
    } catch (error) {
      console.error('Error:', error)
      setMessages((messages) => [
        ...messages,
        { role: 'assistant', content: "I'm sorry, but I encountered an error. Please try again later." },
      ])
    }
    setIsLoading(false)
  }

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      sendMessage()
    }
  }

  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      sx={{
        background: 'linear-gradient(135deg, #E0C3FC 0%, #8EC5FC 100%)',
        padding: 2,
      }}
    >
      <Stack
        direction={'column'}
        width="90%"
        maxWidth="600px"
        height="90%"
        maxHeight="800px"
        borderRadius={3}
        boxShadow="0px 4px 20px rgba(0, 0, 0, 0.1)"
        bgcolor="white"
        p={3}
        spacing={3}
        justifyContent="space-between"
      >
        <Stack
          direction={'column'}
          spacing={2}
          flexGrow={1}
          overflow="auto"
          maxHeight="80%"
          sx={{
            paddingRight: 2,
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: '#424769',
              borderRadius: '4px',
            },
          }}
        >
          {messages.map((message, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={
                message.role === 'assistant' ? 'flex-start' : 'flex-end'
              }
            >
              <Box
                bgcolor={
                  message.role === 'assistant'
                    ? '#f0f0f0' // Light grey for assistant messages
                    : '#6C5E82' // Darker color for user messages
                }
                color={message.role === 'assistant' ? 'black' : 'white'}
                borderRadius={2}
                p={2}
                maxWidth="70%"
                sx={{
                  boxShadow: '0px 2px 12px rgba(0, 0, 0, 0.1)',
                }}
              >
                <Typography variant="body1">
                  {message.content}
                </Typography>
              </Box>
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </Stack>
        <Stack direction={'row'} spacing={2} alignItems="center">
          <TextField
            label="Type your message..."
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            variant="outlined"
            sx={{
              backgroundColor: 'white',
              borderRadius: 2,
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: '#6C5E82',
                },
                '&:hover fieldset': {
                  borderColor: '#424769',
                },
              },
            }}
            InputProps={{
              style: {
                color: 'black',
              },
            }}
            InputLabelProps={{
              style: {
                color: 'gray',
              },
            }}
          />
          <Button
            variant="contained"
            onClick={sendMessage}
            disabled={isLoading}
            sx={{
              backgroundColor: '#6C5E82',
              color: 'white',
              fontWeight: 'bold',
              '&:hover': {
                backgroundColor: '#424769',
              },
              minWidth: '100px',
            }}
          >
            {isLoading ? 'Sending...' : 'Send'}
          </Button>
        </Stack>
      </Stack>
    </Box>
  )
}
