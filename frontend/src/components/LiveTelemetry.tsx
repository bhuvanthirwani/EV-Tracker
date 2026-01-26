import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, Grid, LinearProgress } from '@mui/material';
import { getRequest } from '../api-service';

interface TelemetryData {
    speed: number;
    battery_soc: number;
    lat: number;
    lng: number;
    timestamp: string;
}

const LiveTelemetry: React.FC = () => {
    const [data, setData] = useState<TelemetryData | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchTelemetry = async () => {
        try {
            const response = await getRequest('/telemetry/latest/vh-001', {});
            if (response && response.data) {
                setData(response.data);
                setError(null);
            }
        } catch (err) {
            console.error("Failed to fetch telemetry", err);
            setError("Disconnected from vehicle...");
        }
    };

    useEffect(() => {
        const interval = setInterval(fetchTelemetry, 1000);
        return () => clearInterval(interval);
    }, []);

    if (error) return <Typography color="error">{error}</Typography>;
    if (!data) return <LinearProgress />;

    return (
        <Box sx={{ flexGrow: 1, p: 2 }}>
            <Typography variant="h5" gutterBottom sx={{ color: 'white' }}>Live Vehicle Status: vh-001</Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard title="Speed" value={`${data.speed} km/h`} color="#4caf50" percentage={(data.speed / 200) * 100} />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard title="Battery SOC" value={`${data.battery_soc.toFixed(1)}%`} color="#2196f3" percentage={data.battery_soc} />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard title="Latitude" value={data.lat.toFixed(4)} color="#ff9800" percentage={50} />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard title="Longitude" value={data.lng.toFixed(4)} color="#f44336" percentage={50} />
                </Grid>
            </Grid>
            <Typography variant="caption" sx={{ color: 'gray', mt: 2, display: 'block' }}>
                Last updated: {new Date(data.timestamp).toLocaleTimeString()}
            </Typography>
        </Box>
    );
};

const StatCard = ({ title, value, color, percentage }: { title: string, value: string, color: string, percentage: number }) => (
    <Card sx={{ bgcolor: '#1e1e1e', color: 'white', borderRadius: 2 }}>
        <CardContent>
            <Typography color="gray" variant="subtitle2">{title}</Typography>
            <Typography variant="h4" sx={{ my: 1 }}>{value}</Typography>
            <LinearProgress
                variant="determinate"
                value={Math.min(100, Math.max(0, percentage))}
                sx={{
                    height: 8,
                    borderRadius: 5,
                    bgcolor: 'rgba(255,255,255,0.1)',
                    '& .MuiLinearProgress-bar': { bgcolor: color }
                }}
            />
        </CardContent>
    </Card>
);

export default LiveTelemetry;
