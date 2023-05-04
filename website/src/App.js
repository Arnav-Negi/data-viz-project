import './App.css';
import AgeAreaChart from "./viz/AgeAreaChart/AgeAreaChart";
import {Grid, Paper, styled, Box} from "@mui/material";
import AgeText from "./viz/AgeAreaChart/AgeText";
import BarChartText from "./viz/BarChartRace/BarChartText";

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
}));

function App() {
    return (
        <div>
            <h1>Team Data Based Project</h1>
            <h1 style={{paddingBottom: 50}}>Analysis of Causes of Deaths</h1>
            <Grid container spacing={2}>
                <Grid item xs={6}>
                    <AgeText />
                </Grid>
                <Grid item xs={6}>
                    <AgeAreaChart />
                </Grid>
            </Grid>
            <Grid container spacing={2}>
                <Grid item xs={6}>
                    <div id="terror"></div>
                </Grid>
                <Grid item xs={6}>
                    <BarChartText />
                </Grid>
            </Grid>
        </div>
    );
}

export default App;
