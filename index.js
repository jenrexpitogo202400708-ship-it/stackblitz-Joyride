const express = require('express')
const cors = require('cors')
const path = require('path')

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

// ---------------- DATA ----------------
let riders = [
    { id: 1, name: "Pedro", vehicle: "Motorcycle", available: true },
    { id: 2, name: "Jose", vehicle: "Motorcycle", available: true },
    { id: 3, name: "Mark", vehicle: "Car", available: true }
]

let rides = []
let rideIdCounter = 1
let riderIdCounter = 4

// ---------------- RIDERS ----------------
app.get('/riders', (req, res) => {
    res.json(riders)
})

app.post('/riders', (req, res) => {
    const { name, vehicle } = req.body
    if (!name || !vehicle)
        return res.status(400).json({ message: "Missing fields" })

    const newRider = {
        id: riderIdCounter++,
        name,
        vehicle,
        available: true
    }

    riders.push(newRider)
    res.json(newRider)
})

// ---------------- RANDOM RIDER ----------------
app.get('/random-rider', (req, res) => {
    const available = riders.filter(r => r.available)

    if (!available.length)
        return res.status(400).json({ message: "No riders" })

    const rider = available[Math.floor(Math.random() * available.length)]
    res.json(rider)
})

// ---------------- RIDES ----------------
app.get('/rides', (req, res) => {
    res.json(rides)
})

app.post('/rides', (req, res) => {
    const {
        name,
        number,
        pickup,
        dropoff,
        service,
        distance,
        fare
    } = req.body

    if (!name || !number || !pickup || !dropoff)
        return res.status(400).json({ message: "Missing fields" })

    const availableRider = riders.find(r => r.available)

    if (!availableRider)
        return res.status(400).json({ message: "No available riders" })

    availableRider.available = false

    const newRide = {
        id: rideIdCounter++,
        name,
        number,
        riderId: availableRider.id,
        service,
        pickup,
        dropoff,
        distance,
        fare,
        status: "ongoing",
        timestamp: new Date().toISOString()
    }

    rides.push(newRide)
    res.json(newRide)
})

app.put('/rides/:id', (req, res) => {
    const ride = rides.find(r => r.id === Number(req.params.id))
    if (!ride) return res.status(404).json({ message: "Not found" })

    const { status } = req.body
    if (status) ride.status = status

    if (status === "completed") {
        const rider = riders.find(r => r.id === ride.riderId)
        if (rider) rider.available = true
    }

    res.json(ride)
})

app.delete('/rides/:id', (req, res) => {
    const index = rides.findIndex(r => r.id === Number(req.params.id))
    if (index === -1) return res.status(404).json({ message: "Not found" })

    const ride = rides[index]
    const rider = riders.find(r => r.id === ride.riderId)
    if (rider) rider.available = true

    rides.splice(index, 1)

    res.json({ message: "Ride deleted" })
})

// ---------------- START ----------------
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`)
})
