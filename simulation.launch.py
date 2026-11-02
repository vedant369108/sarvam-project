# Launch file for Gazebo Sim (ros_gz_sim)
import os
from ament_index_python.packages import get_package_prefix, get_package_share_directory
from launch import LaunchContext, LaunchDescription
from launch.actions import (
    AppendEnvironmentVariable,
    DeclareLaunchArgument,
    IncludeLaunchDescription,
    OpaqueFunction,
    TimerAction,
)
from launch.launch_description_sources import PythonLaunchDescriptionSource
from launch.substitutions import LaunchConfiguration

ARGUMENTS = [
    DeclareLaunchArgument(
        'use_sim_time',
        default_value='true',
        choices=['true', 'false'],
        description='Use simulation (Gazebo) clock if true.',
    ),
    DeclareLaunchArgument(
        'world',
        default_value='empty',
        description='World name (without extension, or with .sdf).',
    ),
    DeclareLaunchArgument(
        'robot_name',
        default_value='mtt_robot',
        description='Name of the robot in simulation.',
    ),
    DeclareLaunchArgument(
        'use_rviz',
        default_value='true',
        choices=['true', 'false'],
        description='Whether to start RViz.',
    ),
    DeclareLaunchArgument(
        'run_on_start',
        default_value='true',
        choices=['true', 'false'],
        description='Run simulation immediately on start.',
    ),
    DeclareLaunchArgument(
        'gui_config_file',
        default_value='',
        description='Path to GUI configuration file.',
    ),
    DeclareLaunchArgument(
        'headless',
        default_value='false',
        choices=['true', 'false'],
        description='Launch in headless mode (server only).',
    ),
    DeclareLaunchArgument(
        'verbose',
        default_value='false',
        choices=['true', 'false'],
        description='Launch in verbose mode (-v 4).',
    ),
    # Spawn pose configurations
    DeclareLaunchArgument('x', default_value='0.0', description='Spawn X position'),
    DeclareLaunchArgument('y', default_value='0.0', description='Spawn Y position'),
    DeclareLaunchArgument('z', default_value='0.1', description='Spawn Z position'),
    DeclareLaunchArgument('yaw', default_value='0.0', description='Spawn Yaw heading'),
]


def launch_simulation(context: LaunchContext):
    """Dynamically build the Gazebo launch arguments and launch execution."""
    raw_world = LaunchConfiguration('world').perform(context).strip()
    gui_config_file = LaunchConfiguration('gui_config_file').perform(context).strip()
    headless = LaunchConfiguration('headless').perform(context).lower() in ['true', '1']
    run_on_start = LaunchConfiguration('run_on_start').perform(context).lower() in ['true', '1']
    verbose = LaunchConfiguration('verbose').perform(context).lower() in ['true', '1']

    # Ensure consistent .sdf suffix for Gazebo
    world_file = raw_world if raw_world.endswith('.sdf') else f'{raw_world}.sdf'

    gz_args = []
    if gui_config_file:
        gz_args.append(f'--gui-config "{gui_config_file}"')
    if verbose:
        gz_args.append('-v 4')
    if run_on_start:
        gz_args.append('-r')
    if headless:
        gz_args.append('-s')

    gz_args.append(world_file)

    pkg_ros_gz_sim = get_package_share_directory('ros_gz_sim')
    gz_sim_launch_path = os.path.join(pkg_ros_gz_sim, 'launch', 'gz_sim.launch.py')

    return [
        IncludeLaunchDescription(
            PythonLaunchDescriptionSource(gz_sim_launch_path),
            launch_arguments={'gz_args': ' '.join(gz_args)}.items(),
        )
    ]


def generate_launch_description():
    # Directories
    pkg_robot_description = get_package_share_directory('robot_description')
    pkg_robot_simulator = get_package_share_directory('robot_simulator')
    pkg_robot_worlds = get_package_share_directory('robot_worlds')

    # Model and world resource paths
    resource_paths = [
        os.path.join(pkg_robot_worlds, 'worlds'),
        os.path.join(get_package_prefix('robot_description'), 'share'),
        os.path.join(pkg_robot_worlds, 'models'),
    ]
    resource_path_str = os.pathsep.join(resource_paths)

    # Append to existing resource paths (cross-platform and backward/forward compatible)
    set_gz_resource_path = AppendEnvironmentVariable(
        name='GZ_SIM_RESOURCE_PATH',
        value=resource_path_str,
    )
    set_ign_resource_path = AppendEnvironmentVariable(
        name='IGN_GAZEBO_RESOURCE_PATH',
        value=resource_path_str,
    )

    # Launch file paths
    robot_description_path = os.path.join(
        pkg_robot_description, 'launch', 'robot_rviz.launch.py'
    )
    robot_ros_gz_bridge_path = os.path.join(
        pkg_robot_simulator, 'launch', 'ros_gz_bridge.launch.py'
    )
    robot_spawn_path = os.path.join(
        pkg_robot_simulator, 'launch', 'spawn.launch.py'
    )

    # Robot state / description launch
    robot_description_launch = IncludeLaunchDescription(
        PythonLaunchDescriptionSource(robot_description_path),
        launch_arguments=[
            ('use_sim_time', LaunchConfiguration('use_sim_time')),
            ('use_gui', 'false'),
            ('use_rviz', LaunchConfiguration('use_rviz')),
            ('vehicle', LaunchConfiguration('robot_name')),
            ('robot_name', LaunchConfiguration('robot_name')),
        ],
    )

    # Bridge launch
    robot_ros_gz_bridge_launch = IncludeLaunchDescription(
        PythonLaunchDescriptionSource(robot_ros_gz_bridge_path),
        launch_arguments=[
            ('use_sim_time', LaunchConfiguration('use_sim_time')),
            ('world', LaunchConfiguration('world')),
            ('robot_name', LaunchConfiguration('robot_name')),
        ],
    )

    # Robot spawn launch (Delayed by 3.0s to allow Gazebo world to load first)
    robot_spawn_launch = TimerAction(
        period=3.0,
        actions=[
            IncludeLaunchDescription(
                PythonLaunchDescriptionSource(robot_spawn_path),
                launch_arguments=[
                    ('use_sim_time', LaunchConfiguration('use_sim_time')),
                    ('robot_name', LaunchConfiguration('robot_name')),
                    ('x', LaunchConfiguration('x')),
                    ('y', LaunchConfiguration('y')),
                    ('z', LaunchConfiguration('z')),
                    ('yaw', LaunchConfiguration('yaw')),
                ],
            )
        ],
    )

    ld = LaunchDescription(ARGUMENTS)
    ld.add_action(set_gz_resource_path)
    ld.add_action(set_ign_resource_path)
    ld.add_action(robot_description_launch)
    ld.add_action(robot_ros_gz_bridge_launch)
    ld.add_action(robot_spawn_launch)
    ld.add_action(OpaqueFunction(function=launch_simulation))

    return ld
