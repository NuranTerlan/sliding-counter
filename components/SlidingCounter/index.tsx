import { useCallback, useState } from "react";
import { StyleSheet, Text, Vibration, View } from "react-native";
import {
	GestureHandlerRootView,
	PanGestureHandler,
	PanGestureHandlerGestureEvent,
} from "react-native-gesture-handler";
import Animated, {
	interpolate,
	runOnJS,
	useAnimatedGestureHandler,
	useAnimatedStyle,
	useSharedValue,
	withSpring,
} from "react-native-reanimated";
import CounterIcon from "./CounterIcon";

const COUNTER_WIDTH = 170;
const SLIDING_OFFSET_LIMIT = COUNTER_WIDTH * 0.3;

const clamp = (value: number, min: number, max: number) => {
	"worklet";
	return Math.min(Math.max(value, min), max);
};

interface SlidingCounterProps {
	color?: string;
}

const SlidingCounter = ({ color = "#111" }: SlidingCounterProps) => {
	const [counter, setCounter] = useState(0);

	const manipulateCounter = useCallback((changeCount) => {
		setCounter((prev) => (changeCount ? prev + changeCount : 0));
	}, []);

	const makeVibration = useCallback((time = 75) => {
		Vibration.vibrate(time);
	}, []);

	const translateX = useSharedValue(0);
	const translateY = useSharedValue(0);

	const onPanGestureEvent =
		useAnimatedGestureHandler<PanGestureHandlerGestureEvent>({
			onActive: (e) => {
				translateX.value = clamp(
					e.translationX,
					-SLIDING_OFFSET_LIMIT,
					SLIDING_OFFSET_LIMIT
				);

				translateY.value = clamp(
					e.translationY,
					-SLIDING_OFFSET_LIMIT,
					SLIDING_OFFSET_LIMIT
				);
			},
			onEnd: () => {
				translateX.value = withSpring(0, { stiffness: 270 });
				translateY.value = withSpring(0, { stiffness: 270 });

				if (
					translateY.value > SLIDING_OFFSET_LIMIT / 1.5 ||
					translateY.value < -SLIDING_OFFSET_LIMIT / 1.5
				) {
					runOnJS(manipulateCounter)(0);
					runOnJS(makeVibration)(400);
					return;
				}

				if (translateX.value === SLIDING_OFFSET_LIMIT) {
					runOnJS(manipulateCounter)(1);
					runOnJS(makeVibration)();
					return;
				}

				if (translateX.value === -SLIDING_OFFSET_LIMIT) {
					runOnJS(manipulateCounter)(-1);
					runOnJS(makeVibration)();
					return;
				}
			},
		});

	const rCounterStyle = useAnimatedStyle(() => {
		return {
			transform: [
				{ translateX: translateX.value * 0.1 },
				{ translateY: translateY.value * 0.1 },
			],
		};
	}, []);

	const rGestureButtonStyle = useAnimatedStyle(() => {
		return {
			transform: [
				{ translateX: translateX.value },
				{ translateY: translateY.value },
			],
		};
	}, []);

	const rPlusMinusIconStyle = useAnimatedStyle(() => {
		const opacityX = interpolate(
			translateX.value,
			[-SLIDING_OFFSET_LIMIT, 0, SLIDING_OFFSET_LIMIT],
			[0.4, 0.8, 0.4]
		);

		const opacityY = interpolate(
			translateY.value,
			[-SLIDING_OFFSET_LIMIT, 0, SLIDING_OFFSET_LIMIT],
			[0, 1, 0]
		);

		return {
			opacity: opacityX * opacityY,
		};
	}, []);

	const rCloseIconStyle = useAnimatedStyle(() => {
		const opacity = interpolate(
			translateY.value,
			[
				-SLIDING_OFFSET_LIMIT,
				-SLIDING_OFFSET_LIMIT / 3,
				SLIDING_OFFSET_LIMIT / 3,
				SLIDING_OFFSET_LIMIT,
			],
			[1, 0, 0, 1]
		);

		return {
			opacity,
		};
	}, []);

	return (
		<Animated.View
			style={[styles.counter, { backgroundColor: color }, rCounterStyle]}
		>
			<CounterIcon name="minus" style={rPlusMinusIconStyle} />
			<CounterIcon
				name="close"
				color="#F32013"
				size={30}
				style={rCloseIconStyle}
			/>
			<CounterIcon name="plus" style={rPlusMinusIconStyle} />
			<View style={styles.buttonContainer}>
				<GestureHandlerRootView>
					<PanGestureHandler onGestureEvent={onPanGestureEvent}>
						<Animated.View style={[styles.gestureButton, rGestureButtonStyle]}>
							<Text style={styles.counterNumber}>{counter}</Text>
						</Animated.View>
					</PanGestureHandler>
				</GestureHandlerRootView>
			</View>
		</Animated.View>
	);
};

export default SlidingCounter;

const commonStyles = StyleSheet.create({
	flexCenter: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
	},
});

const styles = StyleSheet.create({
	counter: {
		height: 70,
		width: COUNTER_WIDTH,
		borderRadius: 35,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-evenly",
	},
	buttonContainer: {
		// backgroundColor: "rgba(255, 255, 255, .1)",
		position: "absolute",
		top: 0,
		bottom: 0,
		left: 0,
		right: 0,
		...commonStyles.flexCenter,
	},
	gestureButton: {
		paddingHorizontal: 15,
		paddingVertical: 5,
		backgroundColor: "#444",
		borderRadius: 50,
		borderWidth: 1,
		borderColor: "#fafafa",
	},
	counterNumber: {
		fontSize: 25,
		color: "#fafafa",
	},
});
