# Introduction


## Purpose:


The purpose of this document is to outline the requirements for the System Health
Prediction App, which monitors key system health metrics and predicts CPU
consumption to enhance system stability and performance.


## Scope:


This app will provide real-time monitoring of CPU, memory, disk usage, GPU, and
Wi-Fi. It will offer predictive analytics for CPU consumption and alert users when
consumption exceeds specified thresholds.


# Overall Description


## Product Perspective:


The System Health Prediction App is a standalone application that consists of a frontend
developed in React and a backend powered by Flask. It will integrate PowerShell scripts for
data collection.


## Product Features:


• Monitor real-time system metrics: CPU, memory, disk usage, GPU, and Wi-Fi.

• Display real-time charts for each metric.

• Provide an input box to set CPU consumption thresholds.

• Generate alerts when CPU usage exceeds the defined threshold.

• Use machine learning to predict future CPU consumption.


## User characteristics:


Any individual who wishes to monitor their system performance and receive alerts for any
potential issues.


## Operating Environment:


The application will run on Windows operating systems, utilizing PowerShell for metric
collection.


# Functional Requirements


1. The system shall monitor CPU usage in real-time.
2. The system shall monitor memory usage in real-time.
3. The system shall monitor disk usage in real-time.
4. The system shall monitor GPU usage in real-time.
5. The system shall monitor Wi-Fi status in real-time.
6. The system shall provide real-time charts for each monitored metric.
7. The system shall allow users to set a CPU usage threshold via an input box.
8. The system shall generate an alert if CPU usage exceeds the specified threshold.


# Non-Functional Requirements


1. The system shall provide a user-friendly interface for monitoring metrics and setting
thresholds.

2. The system shall have a response time of less than 2 seconds for loading real-time
metrics.

3. The system shall be reliable, with an uptime of at least 99%.

4. The system shall ensure data privacy and security in accordance with industry
standards.

