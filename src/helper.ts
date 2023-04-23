/**
 * returns the directory of the compose file
 * Example: /etc/app/docker-compose.yml -> /etc/app/
 */
export function getDir(compose_file: string): string {
  return compose_file.slice(0, compose_file.lastIndexOf('docker-compose'));
}