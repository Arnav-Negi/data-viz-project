import * as React from "react";

export default function AgeText() {
    return (
        <React.Fragment>
            <h3>
                Age Stacked Area Chart
            </h3>
            <p>
                This visualization aims to show the amount of DALY (Disability Adjusted Life Years)
                lost over time for different age groups and for different countries.
                It is useful for identifying trends and patterns in health outcomes across
                age groups and over time.
            </p>
            <p>
                The age groups are categorized into 70+ years, 50-69, 15-49, 5-14, and under 5.
                The chart is useful in highlighting trends and patterns in health outcomes,
                especially for children in the under 5 and 5-14 age groups.
            </p>
        </React.Fragment>
    )
}