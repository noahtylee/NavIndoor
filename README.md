
<h1>NavIndoor: A Systematic Approach to Indoor Navigation</h1>
<p>Despite society’s growing reliance on GPS navigation, one flaw sticks out - it doesn’t work indoors. To remedy this problem, solutions to indoor navigation have consisted of expensive physical infrastructure that is infeasible to implement in most public spaces. As a result, while indoor navigation systems can support emergency evacuation plans and assist the visually impaired in traveling independently, they are far from widely accessible. My project proposal is a mobile smartphone application that provides directions to desired destinations within an indoor environment, similarly to GPS navigation systems. My approach consists of two steps: first, generating a virtual map of the indoor environment and second, navigating the indoor environment. In order to generate a virtual indoor map, I plan to utilize smartphone inertial sensors to measure distance between points of interest within an indoor environment. The application will then generate a node graph representing the indoor environment. After the virtual map has been generated the user can input a starting and ending point to navigate. From there, Dijkstra’s algorithm will be implemented to help the user navigate between those two points by calculating the shortest path on the node graph and displaying the path on the application. Combined with heading estimation techniques, the application is able to track the user’s position as they move along the path, providing directions on where to go.</p>
<hr>
<h2>Approach</h2>
<p>In order to combat the accessibility of indoor navigation systems, my project focuses on smartphones as the primary medium for navigation. Unlike wifi fingerprinting or bluetooth beacons, smartphones are widely used by the public on a daily basis, making indoor navigation available and feasible in most places. As a result, the inertial sensors within smartphones can be leveraged to track user position and provide indoor navigation.
<br>
In order to generate the indoor navigation system, the application consists of two steps: map generation and user navigation. In map generation, the user manually creates a virtual map of the indoor environment through the application, which can then be used for navigation. This is accomplished by tracking the smartphone’s displacement between points of interest, which includes indoor landmarks, rooms, intersections, or other important locations. From there, the application consolidates the distances between points of interest and constructs a node graph representation of the indoor environment, consisting of points of interest as the nodes and the distances between them as the edges. This information is stored in a backend database, which can then be retrieved when a user chooses to navigate the indoor space.
<br>
<h3>Map Generation:</h3>
<img src="https://github.com/noahtylee/NavIndoor/assets/91506066/0ac73fa6-7f50-44ee-be22-d147ebd68ef3" />
<br>
For user navigation, Dijkstra’s algorithm will be applied on the previously generated node graph to find the shortest path between two locations that the user inputs. A pedestrian dead reckoning algorithm (PDR) with inertial sensors, including the accelerometer, gyroscope, and magnetometer, will be applied to track the user’s position along that path. The application estimates the number of steps that the user has taken by tracking the time between peaks of acceleration. From there, the difference between the peaks and valleys of acceleration data are used to estimate the user’s step length. By combining step detection and step length estimation, the application is able to track user position.
<br>
<h3>User Navigation:</h3>
<img src="https://github.com/noahtylee/NavIndoor/assets/91506066/5e736ec8-592b-44ee-96e3-de6349fd749c" />
<br>
<p>
In order to combat the inaccuracies presented by inertial sensors, the application  processes the inertial sensor data through a low pass filter, helping to avoid any sudden changes in data.
</p>
<hr>
<h2>Data Analysis</h2>
<p>The PDR error for low distances was minimal, with the error remaining under one meter when the smartphone was displaced between zero and six meters. After six meters of displacement, the PDR error began to rise more dramatically, reaching a position error above one meter. This demonstrates that the PDR algorithm is largely accurate for low distances, but increases as the smartphone is displaced further. This increasing error can largely be attributed to error accumulation from the accelerometer data. While the accumulated error at low distances is largely negligible, the error continues to accumulate as the smartphone is displaced further. This causes greater differences between the estimated position and the real position at higher distances, as the PDR algorithm is more prone to receiving inaccurate data from the accelerometer. The average standard deviation across three trials was 1.61, indicating a moderate level of variability in the measurements.</p>
<img src="https://github.com/noahtylee/NavIndoor/assets/91506066/888fd111-9205-4dab-ad83-14444f31f56c" />
<br>
<img src="https://github.com/noahtylee/NavIndoor/assets/91506066/882321dd-1f49-4e81-9f1e-7981b37e3842" />
<hr>
<h2>References</h2>
<p>
Fan, Q., Zhang, H., Pan, P., Zhuang, X., Jia, J., Zhang, P., Zhao, Z., Zhu, G., & Tang, Y. (2019). Improved pedestrian dead reckoning based on a robust adaptive Kalman filter for indoor inertial location system. Sensors, 19(2), 294. https://doi.org/10.3390/s19020294 
  
Gupta, N., Mangla, K., Jha, A. K., & Umar, M. (2016). Applying Dijkstra’s algorithm in routing process. Int. J. New Technol. Res, 2(5), 122-124.

Kang, T., & Shin, Y. (2021). Indoor navigation algorithm based on a smartphone inertial measurement unit and map matching. 2021 International Conference on Information and Communication Technology Convergence (ICTC). https://doi.org/10.1109/ictc52510.2021.9621096 

Kang, W., Nam, S., Han, Y., & Lee, S. (2012). Improved heading estimation for smartphone-based indoor positioning systems. 2012 IEEE 23rd International Symposium on Personal, Indoor and Mobile Radio Communications - (PIMRC). https://doi.org/10.1109/pimrc.2012.6362768 

Mairu, M. SmartPDR For React Native, Github repository, https://github.com/Firecommit/react-native-smartpdr

Verma, S., Omanwar, R., Sreejith, V., & Meera, G. S. (2016). A smartphone based indoor navigation system. 2016 28th International Conference on Microelectronics (ICM). https://doi.org/10.1109/icm.2016.7847886
</p>
