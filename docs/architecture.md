# Architecture

## Core pipeline
ingest -> normalize -> enqueue/process -> rule evaluation -> persistence -> query -> notification

## Main subsystems
- Ingest API
- Event normalization
- Rule engine
- Event storage
- Cost aggregation
- Alert generation
- Notification routing
- Dashboard query layer

## Key principles
- fast ingest path
- async-friendly design
- stable standard event schema
- raw payload preserved separately
- workspace isolation
- deterministic rule evaluation

## Storage strategy
- raw audit events
- aggregate cost buckets
- alert records
- rule definitions

## Frontend views
- Timeline
- Alerts
- Rules
- Costs