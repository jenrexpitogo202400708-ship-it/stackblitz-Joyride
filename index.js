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

let riders = [
    { id: 1, name: "Pedro", vehicle: "Motorcycle", available: true },
    { id: 2, name: "Jose", vehicle: "Motorcycle", available: true },
    { id: 3, name: "Mark", vehicle: "Car", available: true }
]

let rides = []

let riderIdCounter = 4
let rideIdCounter = 1

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
    res.status(201).json(newRider)
})

app.put('/riders/:id', (req, res) => {
    const rider = riders.find(r => r.id === Number(req.params.id))
    if (!rider) return res.status(404).json({ message: "Rider not found" })

    const { name, vehicle, available } = req.body

    if (name) rider.name = name
    if (vehicle) rider.vehicle = vehicle
    if (available !== undefined) rider.available = available

    res.json(rider)
})

app.get('/available-riders', (req, res) => {
    res.json(riders.filter(r => r.available))
})

app.get('/random-rider', (req, res) => {
    const available = riders.filter(r => r.available)

    if (!available.length)
        return res.status(400).json({ message: "No riders" })

    const rider = available[Math.floor(Math.random() * available.length)]
    res.json(rider)
})

app.get('/rides', (req, res) => {
    res.json(rides)
})

app.post('/rides', (req, res) => {
    const { name, number, pickup, dropoff, service, distance, fare } = req.body

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
        timestamp: new Date()
    }

    rides.push(newRide)
    res.status(201).json(newRide)
})

app.get('/rides/:id', (req, res) => {
    const ride = rides.find(r => r.id === Number(req.params.id))
    if (!ride) return res.status(404).json({ message: "Not found" })

    res.json(ride)
})

app.put('/rides/:id', (req, res) => {
    const ride = rides.find(r => r.id === Number(req.params.id))
    if (!ride) return res.status(404).json({ message: "Ride not found" })

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

app.get('/rides/status/:status', (req, res) => {
    res.json(
        rides.filter(r => r.status.toLowerCase() === req.params.status.toLowerCase())
    )
})

app.get('/stats', (req, res) => {
    res.json({
        totalUsers: rides.length,
        totalRiders: riders.length,
        totalRides: rides.length,
        ongoing: rides.filter(r => r.status === "ongoing").length,
        completed: rides.filter(r => r.status === "completed").length
    })
})

app.get('/health', (req, res) => {
    res.json({ status: "JoyRide API running" })
})

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`)
})
