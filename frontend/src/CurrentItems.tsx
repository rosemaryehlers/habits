import React from 'react';

interface CurrentItemsProps {
    selectedView: string;
}

class CurrentItems extends React.Component<CurrentItemsProps, {}> {
    constructor(props: CurrentItemsProps) {
        super(props);
        this.state = {
            items: [
                {
                    id: 1,
                    name: "Clean Kitchen",
                    type: "finite",
                    status: {
                        goal: 1,
                        count: 0
                    }
                },
                {
                    id: 2,
                    name: "Clean Bathroom",
                    type: "finite",
                    status: {
                        goal: 1,
                        count: 1
                    }
                },
                {
                    id: 3,
                    name: "Trash",
                    type: "infinite",
                    status: {
                        count: 2
                    }
                }
            ]
        }
    }

    render() {
        return (
            <div>Current Items</div>
        );
    }
}

export default CurrentItems;