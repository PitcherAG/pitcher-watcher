module.exports = {
  resolveSnapshotPath: (testPath, snapshotExtension) =>
    testPath.replace('unit', 'unit/__snapshots__') + snapshotExtension,
  resolveTestPath: (snapshotFilePath, snapshotExtension) =>
    snapshotFilePath.replace('unit/__snapshots__', 'unit').slice(0, -snapshotExtension.length),
  testPathForConsistencyCheck: '',
}
