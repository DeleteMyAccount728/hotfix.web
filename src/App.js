import React, { useState } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import Home from './panels/Home';
import Place from './panels/Place';
import Basket from './panels/Basket';
import Order from './panels/Order';
import Orders from './panels/Orders';

import './panels/App.css';
import kfc from './img/kfc.png';
import burger from './img/burger.png';
import mcdac from './img/mcdac.png';
import sub from './img/sub.png';
import OneTowar from './img/1.png';
import TwoTowar from './img/2.png';
import ThreeTowar from './img/3.png';
import FourTowar from './img/4.png';


const FOOD_AREAS = [{
	id: 'pizikiva-gallery',
	name: 'ТРЦ "Им.Пыжикова"',
	items: [{
		id: 'kfc',
		name: 'KFC',
		link: '/place/pizikiva-gallery/kfc',
		description: 'Сеть ресторанов быстрого питания',
		image: kfc,
		foods: [{
			id: 'classic',
			image: FourTowar,
			name: 'Классик',
			price: 150,
		}, {
			id: 'bigmac',
			image: OneTowar,
			name: 'Картофель фри',
			price: 50,
		}],
	}, {
		id: 'burger-king',
		name: 'Burger King',
		link: '/place/pizikiva-gallery/burger-king',
		description: 'Сеть ресторанов быстрого питания',
		image: burger,
		foods: [{
			id: 'OneTowar',
			name: 'Товар № 1',
			composition: 'Состав: по ГОСТу',
			price: 630,
			image: OneTowar,
		}, {
			id: 'TwoTowar',
			name: 'Товар № 2',
			composition: 'Состав: по ГОСТу',
			price: 450,
			image: TwoTowar,
		}, {
			id: 'ThreeTowar',
			name: 'Товар № 3',
			composition: 'Состав: по ГОСТу',
			price: 800,
			image: ThreeTowar,
		}, {
			id: 'FourthTowar',
			name: 'Товар № 4',
			composition: 'Состав по ГОСТу',
			price: 600,
			image: FourTowar,
		}],
	}, {
		id: 'macdac',
		name: 'McDonal\'s',
		link: '/place/pizikiva-gallery/macdac',
		description: 'Сеть ресторанов быстрого питания',
		image: mcdac,
		foods: [{
			id: 'hamburger',
			image: TwoTowar,
			name: 'Гамбургер',
			price: 50,
		}, {
			id: 'bigmac',
			image: ThreeTowar,
			name: 'Биг мак',
			price: 200,
		}],
	}, {
		id: 'subway',
		name: 'SubWay',
		link: '/place/pizikiva-gallery/subway',
		image: sub,
		description: 'Сеть ресторанов быстрого питания',
		foods: [{
			id: 'melt-sub',
			image: ThreeTowar,
			name: 'Сабвей мелт',
			price: 300,
		}, {
			id: 'day-sub',
			image: OneTowar,
			name: 'Саб дня',
			price: 200,
		}],
	}],
}];

const placesMap = FOOD_AREAS.reduce((result, area) => {
	area.items.forEach(item => {
		result[item.link] = item;
	});

	return result;
}, {});

const App = () => {
	const [ orderStatuses, setOrderStatuses ] = useState(JSON.parse((localStorage.getItem('orderStatuses') || 'null')) || {});
	const [ order, setOrder ] = useState(JSON.parse((localStorage.getItem('orders') || 'null')) || {});

	return (
		<Router>
			<Switch>
				<Route path="/" exact>
					<Home foodAreas={FOOD_AREAS} order={order} />
				</Route>
				<Route path="/order/:areaId/:itemId" exact>
					<Order
						foodAreas={FOOD_AREAS}
						order={order}
						setActiveOrder={({ itemId }) => {
							const nextStatuses = {...orderStatuses};

							nextStatuses[itemId] = 'ACTIVE';

							setOrderStatuses(nextStatuses);
							localStorage.setItem('orderStatuses', JSON.stringify(nextStatuses));
						}}
					/>
				</Route>
				<Route path="/basket/:areaId/:itemId" exact>
					<Basket
						foodAreas={FOOD_AREAS}
						order={order}
					/>
				</Route>
				<Route
					path="/orders"
					exact
				>
					<Orders 
						order={order}
						orderStatuses={orderStatuses}
						foodAreas={FOOD_AREAS}
						setFinishedOrder={({ itemId }) => {
							const nextStatuses = {...orderStatuses};

							nextStatuses[itemId] = 'CANCELED';

							setOrderStatuses(nextStatuses);
							localStorage.setItem('orderStatuses', JSON.stringify(nextStatuses));
						}}
						setActiveOrder={({ itemId }) => {
							const nextStatuses = {...orderStatuses};

							nextStatuses[itemId] = 'ACTIVE';

							setOrderStatuses(nextStatuses);
							localStorage.setItem('orderStatuses', JSON.stringify(nextStatuses));
						}}
					/>
				</Route>
				<Route 
					path="/place/:area/:place"
					render={routeProps => {
						return (
							<Place
								{...routeProps}
								item={placesMap[routeProps.location.pathname]}
								area={FOOD_AREAS[0]}
								order={order}
								onIncrementPosition={({ foodId, itemId, areaId }) => {
									const updatedOrder = {...order};
									if (foodId in updatedOrder) {
										updatedOrder[foodId].count++;
									} else {
										let item = FOOD_AREAS.filter(area => {
												return area.id === areaId;
											})[0].items.filter(item => {
												return item.id === itemId;
											})[0].foods.filter(food => {
												return food.id === foodId;
											})[0];
										updatedOrder[foodId] = {
											item: item,
											count: 1,
											placeId: itemId
										};
									}

									let nextOrderStatuses = {...orderStatuses};

									if (Object.keys(nextOrderStatuses).length === 0) {
										FOOD_AREAS.forEach(area => {
											area.items.forEach(item => {
												item.foods.forEach(food => {
													if (food.id in order) {
														const status = item.id === itemId ? 'ACTIVE' : 'DONE';

														nextOrderStatuses[item.id] = status;
													}
												});
											});
										});
									}

									const serialized = JSON.stringify(updatedOrder);
									
									localStorage.setItem('orders', serialized);
									localStorage.setItem('orderStatuses', JSON.stringify(nextOrderStatuses));

									setOrder(updatedOrder);
									setOrderStatuses(nextOrderStatuses);
								}}
								onDecrementPosition={({ foodId, itemId, areaId }) => {
									const updatedOrder = {...order};

									if (foodId in updatedOrder) {
										if (updatedOrder[foodId].count === 1) {
											delete updatedOrder[foodId];
										} else {
											updatedOrder[foodId].count--;
										}
									}

									let nextOrderStatuses = {...orderStatuses};

									if (Object.keys(nextOrderStatuses).length === 0) {
										FOOD_AREAS.forEach(area => {
											area.items.forEach(item => {
												item.foods.forEach(food => {
													if (food.id in order) {
														const status = item.id === itemId ? 'ACTIVE' : 'DONE';

														nextOrderStatuses[item.id] = status;
													}
												});
											});
										});
									}

									const serialized = JSON.stringify(updatedOrder);
									
									localStorage.setItem('orders', serialized);
									localStorage.setItem('orderStatuses', JSON.stringify(nextOrderStatuses));

									setOrder(updatedOrder);
									setOrderStatuses(nextOrderStatuses);
								}}
							/>
						);
					}}
				/>
			</Switch>
		</Router>
	);
}

export default App;
